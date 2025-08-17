// server.js
// Бэк без БД: читаем TRON напрямую и кэшируем ответы.
// Фронт НЕ меняем.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// === НАСТРОЙКИ ===
const ADDRESS = process.env.ODC_TRON_ADDRESS || "TX5iuanUcs1YubXrFyDtM3L7Jvhr4vWyij";
const USDT_CONTRACT = process.env.ODC_USDT_CONTRACT || "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

// TronScan публичные эндпоинты
const TS = {
  tokens: (addr) =>
    `https://apilist.tronscanapi.com/api/account/tokens?address=${addr}&start=0&limit=100&hidden=0&show0=false`,
  trc20Transfers: (q) =>
    `https://apilist.tronscanapi.com/api/token_trc20/transfers?${q}`,
};

async function fetchJSON(url, { retries = 3, pause = 600 } = {}) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, { headers: { accept: "application/json" } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, pause));
    }
  }
  throw lastErr;
}

// ===== КЭШ (простенький, в памяти) =====
const cache = new Map();
function setCache(key, value, ttlMs) {
  cache.set(key, { value, exp: Date.now() + ttlMs });
}
function getCache(key) {
  const c = cache.get(key);
  if (!c) return null;
  if (Date.now() > c.exp) {
    cache.delete(key);
    return null;
  }
  return c.value;
}

// ===== UTILS =====
function toFixed(n, d = 2) {
  return Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
}

// Читаем баланс USDT TRC-20 адреса
async function getUsdtBalance(addr) {
  const ck = `bal:${addr}`;
  const cached = getCache(ck);
  if (cached != null) return cached;

  const j = await fetchJSON(TS.tokens(addr));
  const row =
    (j?.data || []).find(
      (t) =>
        t.tokenId === USDT_CONTRACT ||
        t.tokenName === "Tether USD" ||
        t.tokenAbbr === "USDT"
    ) || null;

  let bal = 0;
  if (row) {
    const prec = row.tokenDecimal ?? row.tokenPrecision ?? 6;
    const raw = Number(row.balance ?? row.quantity ?? row.amount ?? 0);
    bal = raw / Math.pow(10, prec);
  }
  setCache(ck, bal, 15_000); // 15 сек
  return bal;
}

// Возвращает массив входящих USDT-трансферов (последние N)
async function getIncomingUsdt(addr, { limit = 200 } = {}) {
  const q = new URLSearchParams({
    toAddress: addr,
    contract_address: USDT_CONTRACT,
    start: "0",
    limit: String(limit),
  }).toString();
  const j = await fetchJSON(TS.trc20Transfers(q));
  const arr = j?.token_transfers || j?.data || [];
  return arr.map((t) => ({
    txId: t.transaction_id || t.txHash || t.hash,
    from: t.from || t.from_address,
    to: t.to || t.toAddress,
    amount: parseFloat(t.amount_str ?? t.quant ?? t.amount ?? "0"),
    ts: Number(t.block_ts || t.timestamp || 0),
  }));
}

// ===== API =====

// БАНК
app.get("/api/bank", async (req, res) => {
  try {
    const total = await getUsdtBalance(ADDRESS);
    res.json({ ok: true, total: toFixed(total, 2), half: toFixed(total / 2, 2) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// СТАТИСТИКА (игроки/неделя)
app.get("/api/stats", async (req, res) => {
  try {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const arr = await getIncomingUsdt(ADDRESS, { limit: 500 });
    // игрок — любой, кто прислал около 1 USDT
    const players = new Set(
      arr
        .filter((t) => t.ts >= weekAgo && Math.abs(t.amount - 1) <= 0.01)
        .map((t) => (t.from || "").toUpperCase())
    );
    res.json({ ok: true, players: players.size });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, players: 0 });
  }
});

// ПОБЕДИТЕЛЬ (заглушка, чтобы фронт не падал)
app.get("/api/latest-winner", async (_req, res) => {
  res.json({ ok: true, nickname: null });
});

// ПРОВЕРКА ПЛАТЕЖА (кнопка "Я перевёл(а)")
app.post("/api/check-payment", async (req, res) => {
  try {
    const now = Date.now();
    const since = now - 45 * 60 * 1000; // 45 минут назад
    // несколько попыток (TronScan иногда отстаёт)
    for (let i = 0; i < 3; i++) {
      const arr = await getIncomingUsdt(ADDRESS, { limit: 200 });
      const hit = arr.find(
        (t) => t.ts >= since && Math.abs(t.amount - 1) <= 0.01
      );
      if (hit) {
        return res.json({
          ok: true,
          found: true,
          txId: hit.txId,
          amount: hit.amount,
          ts: hit.ts,
        });
      }
      await new Promise((r) => setTimeout(r, 4000));
    }
    res.json({ ok: true, found: false });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ===== СТАТИКА (твой фронт без изменений) =====
app.use(express.static(__dirname, { extensions: ["html"] }));

// ===== СТАРТ =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ODC backend up on :${PORT}`);
  console.log(`TRON address: ${ADDRESS}`);
});
