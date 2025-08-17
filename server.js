import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

// === Настройки ===
const TRON_ADDRESS = "TX5iuanUcs1YubXrFyDtM3L7Jvhr4vWyij";
const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";
const TRONGRID_KEY = process.env.TRONGRID_API_KEY || ""; // если есть ключ

// === Утилита ===
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// === Получение входящих переводов USDT ===
async function getIncomingUsdt(addr) {
  // 1. TronScan
  try {
    const j = await fetchJSON(
      `https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=200&start=0&toAddress=${addr}&contract_address=${USDT_CONTRACT}`
    );
    const arr = j?.token_transfers || j?.data || [];
    if (arr.length > 0) {
      return arr.map((t) => ({
        txId: t.transaction_id || t.hash,
        from: t.from_address || t.from,
        amount: parseFloat(t.amount_str ?? t.quant ?? t.amount ?? "0"),
        ts: Number(t.block_ts || t.timestamp || 0),
      }));
    }
  } catch (e) {
    console.warn("TronScan failed, trying TronGrid:", e.message);
  }

  // 2. TronGrid (fallback)
  const headers = TRONGRID_KEY ? { "TRON-PRO-API-KEY": TRONGRID_KEY } : {};
  const j = await fetchJSON(
    `https://api.trongrid.io/v1/accounts/${addr}/transactions/trc20?limit=200&only_to=true&contract_address=${USDT_CONTRACT}`,
    { headers }
  );
  const arr = j?.data || [];
  return arr.map((t) => ({
    txId: t.transaction_id || t.txID,
    from: t.from || t.from_address || t.transfer_from_address,
    amount: parseFloat(t.value ?? t.amount ?? t.quant ?? t.amount_str ?? "0"),
    ts: Number(t.block_timestamp || t.timestamp || 0),
  }));
}

// === Получение баланса (всего USDT) ===
async function getBalance(addr) {
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

// === API эндпоинт для фронта ===
app.get("/api/stats", async (req, res) => {
  try {
    const [txs, balance] = await Promise.all([
      getIncomingUsdt(TRON_ADDRESS),
      getBalance(TRON_ADDRESS),
    ]);

    // считаем игроков
    const uniqueSenders = new Set();
    let total = 0;
    for (const t of txs) {
      if (t.amount >= 1) {
        total += t.amount;
        uniqueSenders.add(t.from);
      }
    }

    res.json({
      bank: Math.floor(total / 2), // половина банка
      players: uniqueSenders.size,
      totalReceived: total,
      balance,
    });
  } catch (e) {
    console.error("stats error:", e);
    res.status(500).json({ error: "internal error" });
  }
});

// === Запуск ===
app.listen(PORT, () => {
  console.log(`ODC backend up on :${PORT}`);
  console.log("TRON address:", TRON_ADDRESS);
});
