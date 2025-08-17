import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PLAYERS_FILE = path.join(__dirname, "players.json");

// ✅ функция для чтения игроков
function getPlayers() {
  try {
    if (fs.existsSync(PLAYERS_FILE)) {
      return JSON.parse(fs.readFileSync(PLAYERS_FILE, "utf8"));
    }
    return [];
  } catch (e) {
    console.error("players.json read error:", e);
    return [];
  }
}

// ---------------- API ----------------

// Кол-во игроков
app.get("/api/stats", (req, res) => {
  const players = getPlayers();
  res.json({ players: players.length });
});

// Банк = количество игроков × 10 USDT
app.get("/api/bank", (req, res) => {
  const players = getPlayers();
  const fakeBank = players.length * 10; // общий банк
  const half = Math.floor(fakeBank / 2); // половина
  res.json({ half });
});

// Последний победитель
app.get("/api/latest-winner", (req, res) => {
  res.json({ nickname: null });
});

// Проверка платежа — всегда успех
app.post("/api/check-payment", (req, res) => {
  res.json({ ok: true, found: true });
});

// -------------------------------------

app.listen(PORT, () => {
  console.log(`ODC backend up on :${PORT}`);
});
