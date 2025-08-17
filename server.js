// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Раздача фронта из public/
app.use(express.static(path.join(__dirname, "public")));

const DEMO = process.env.ODC_DEMO === "1";

// ===== API =====

// Банк: половина банка (для главной) + total на случай отображения целого
app.get("/api/bank", async (req, res) => {
  if (DEMO) {
    const total = 6737;           // твои демо-цифры
    const half = total / 2;       // 3368.5
    return res.json({ ok: true, demo: true, total, half });
  }
  // TODO: здесь реальный подсчёт по TRC-20 (когда подключим)
  return res.json({ ok: true, demo: false, total: 0, half: 0 });
});

// Общая статистика
app.get("/api/stats", async (req, res) => {
  if (DEMO) {
    return res.json({
      ok: true,
      demo: true,
      players: 12197,   // твои демо-цифры
      bank: 6737,
      totalReceived: 6737
    });
  }
  // TODO: здесь реальные цифры
  return res.json({
    ok: true,
    demo: false,
    players: 0,
    bank: 0,
    totalReceived: 0
  });
});

// Любые другие пути — index.html (SPA-фоллбек)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`ODC backend up on :${PORT} (DEMO=${DEMO ? "ON" : "OFF"})`);
});
