import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// ================== НАСТРОЙКИ ==================
const PORT = process.env.PORT || 10000;

// адрес и контракт USDT (TRC20)
const TRON_ADDRESS = "TX5iuanUcs1YubXrFyDtM3L7Jvhr4vWyij";
const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

// опционально: ключ TronGrid (Render -> Environment -> TRONGRID_API_KEY)
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY || "";

// ================== БАЗОВАЯ НАСТРОЙКА APP ==================
const app = express();
app.use(cors());
app.use(express.json());

// раздаём статику без изменения фронта:
// 1) корень (чтобы /index.html, /payment.html и т.п. работали как сейчас)
// 2) папку /public (если там лежат ассеты: /public/i18n.js и т.д.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

// если открыть просто / — отдаём index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================== УТИЛИТЫ ==================
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function round6(n) {
  // аккуратно округляем до 6 знаков (для USDT хватает)
  return Math.round(n * 1e6) / 1e6;
}

// Получение входящих USDT (fallback TronScan -> TronGrid)
async function getIncomingUsdt(addr) {
  // 1) TronScan
  try {
    const j = await fetchJSON(
      `https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=200&start=0&toAddress=${addr}&contract_address=${USDT_CONTRACT}`
    );
    const arr = j?.token_transfers || j?.data || [];
    if (arr.length) {
      return arr.map((t) => ({
        txId: t.transaction_id || t.txHash || t.hash || "",
        from: t.from_address || t.from || "",
        to: t.to_address || t.to || addr,
        amount: parseFloat(t.amount_str ?? t.quant ?? t.amount ?? "0"),
        ts: Number(t.block_ts || t.timestamp || 0),
      }));
    }
  } catch (e) {
    console.warn("TronScan incoming failed:", e.message);
  }

  // 2) TronGrid fallback
  const headers = TRONGRID_API_KEY
    ? { "TRON-PRO-API-KEY": TRONGRID_API_KEY }
    : {};
  const j = await fetchJSON(
    `https://api.trongrid.io/v1/accounts/${addr}/transactions/trc20?limit=200&only_to=true&contract_address=${USDT_CONTRACT}`,
    { headers }
  );
  const arr = j?.data || [];
  return arr.map((t) => ({
    txId: t.transaction_id || t.txID || t.txid || "",
    from: t.from || t.from_address || t.transfer_from_address || "",
    to: t.to || t.to_address || t.transfer_to_address || addr,
    amount: parseFloat(
      t.value ?? t.amount ?? t.quant ?? t.amount_str ?? "0"
    ),
    ts: Number(t.block_timestamp || t.timestamp || 0),
  }));
}

// Получаем баланс USDT (можно не использовать, но эндпоинт оставлю)
async function getUsdtBalance(addr) {
  try {
    const j = await fetchJSON(
      `https://apilist.tronscanapi.com/api/account/tokens?address=${addr}&start=0&limit=50&hidden=0&show0=false`
    );
    const token = (j?.data || []).find(
      (t) => t.tokenId === USDT_CONTRACT || t.tokenAbbr === "USDT"
    );
    if (token) return parseFloat(token.balance) || 0;
  } catch (e) {
    console.warn("TronScan balance failed:", e.message);
  }
  return 0;
}

// ================== ПАМЯТЬ СЕРВЕРА ==================
// запоминаем обработанные tx, чтобы check-payment не «ловил» одну и ту же
const processedTx = new Set();

// ================== API ДЛЯ ФРОНТА ==================
// /api/stats — живые цифры: половина банка и число игроков
app.get("/api/stats", async (req, res) => {
  try {
    const txs = await getIncomingUsdt(TRON_ADDRESS);

    // уникальные отправители (кто перечислил >=1 USDT)
    const uniqueSenders = new Set();
    let total = 0;

    for (const t of txs) {
      if (t.amount >= 1) {
        total += t.amount;
        if (t.from) uniqueSenders.add(t.from);
      }
    }

    const bankHalf = round6(total * 0.5);

    res.json({
      ok: true,
      players: uniqueSenders.size,
      bank: bankHalf,          // половина «банка» — то, что показываем на главной
      totalReceived: round6(total),
    });
  } catch (e) {
    console.error("stats error:", e);
    res.status(500).json({ ok: false, error: "stats_failed" });
  }
});

// совместимость со старым фронтом
app.get("/api/bank", async (req, res) => {
  try {
    const txs = await getIncomingUsdt(TRON_ADDRESS);
    let total = 0;
    for (const t of txs) if (t.amount >= 1) total += t.amount;
    res.json({ ok: true, half: round6(total * 0.5) });
  } catch (e) {
    res.status(500).json({ ok: false, error: "bank_failed" });
  }
});

// минимальная заглушка победителя (позже подцепите реальный стор)
app.get("/api/latest-winner", (req, res) => {
  res.json({ ok: true, nickname: null });
});

// /api/check-payment — ищем НОВЫЙ входящий ровно 1 USDT за последние 2 часа
app.post("/api/check-payment", async (req, res) => {
  try {
    const txs = await getIncomingUsdt(TRON_ADDRESS);
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;

    // допуск на округление/комиссии кошельков ±0.005 USDT
    const isOneDollar = (v) => Math.abs(v - 1) <= 0.005;

    // ищем свежую неучтённую транзакцию ровно на 1 USDT
    const fresh = txs.find(
      (t) =>
        isOneDollar(t.amount) &&
        now - t.ts < twoHours &&
        !processedTx.has(t.txId)
    );

    if (fresh) {
      processedTx.add(fresh.txId);
      return res.json({ ok: true, found: true, txId: fresh.txId });
    }
    return res.json({ ok: true, found: false });
  } catch (e) {
    console.error("check-payment error:", e);
    res.status(500).json({ ok: false, error: "check_failed" });
  }
});

// ================== СТАРТ ==================
app.listen(PORT, () => {
  console.log(`ODC backend up on :${PORT}`);
  console.log("TRON address:", TRON_ADDRESS);
});
