import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// 📌 Все статики из public/
app.use(express.static(path.join(__dirname, "public")));

// --- API заглушки (потом подставим реальные данные) ---
app.get("/api/bank", (req, res) => {
  res.json({ ok: true, half: 6737 }); // временно ставим 6737$
});

app.get("/api/stats", (req, res) => {
  res.json({
    ok: true,
    players: 12197,
    bank: 13474, // банк целиком
    totalReceived: 13474,
  });
});

// 📌 Фоллбек — всегда index.html (чтобы React/Tilda роутинг не падал)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ ODC backend up on :${PORT}`);
});
