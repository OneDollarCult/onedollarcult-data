// server.js (ESM)
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ===== STATIC =====
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG (можно менять только через ENV в Render) =====
const BANK_TOTAL = Number(process.env.ODC_BANK_TOTAL ?? 6737);   // общий банк
const PLAYERS     = Number(process.env.ODC_PLAYERS    ?? 12197); // игроков
const LAST_WINNER = process.env.ODC_LAST_WINNER ?? "";           // опционально
const LAST_DATE   = process.env.ODC_LAST_DATE   ?? "";           // опционально ISO

// ===== API =====
app.get("/api/bank", (req, res) => {
  const half = Math.round((BANK_TOTAL / 2) * 100) / 100;
  res.json({ ok: true, total: BANK_TOTAL, half });
});

app.get("/api/stats", (req, res) => {
  res.json({ ok: true, players: PLAYERS, bank: BANK_TOTAL, totalReceived: BANK_TOTAL });
});

app.get("/api/latest-winner", (req, res) => {
  const amount = LAST_WINNER ? Math.round((BANK_TOTAL / 2) * 100) / 100 : null;
  res.json({ ok: true, nickname: LAST_WINNER || null, amount, date: LAST_DATE || null });
});

// всё остальное — на индекс
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`ODC backend up on :${PORT}`);
});
