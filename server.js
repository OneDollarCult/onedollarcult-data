require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS (разрешаем Tilda)
app.use(cors({ origin: "*" }));

// Директория для аватаров
app.use("/avatars", express.static(path.join(__dirname, "avatars")));
const upload = multer({ dest: "avatars/" });

// Файлы базы
const PLAYERS_FILE = "players.json";
if (!fs.existsSync(PLAYERS_FILE)) fs.writeFileSync(PLAYERS_FILE, "[]");
const WINNERS_FILE = "winners.json";
if (!fs.existsSync(WINNERS_FILE)) fs.writeFileSync(WINNERS_FILE, "[]");

// Обработка Join
app.post("/api/join", upload.single("avatar"), (req, res) => {
    const { nickname, email } = req.body;
    const avatar = req.file ? `/avatars/${req.file.filename}` : null;

    if (!nickname || !email) {
        return res.json({ success: false, error: "Имя и Email обязательны" });
    }

    // Сохраняем игрока в players.json
    const players = JSON.parse(fs.readFileSync(PLAYERS_FILE));
    players.push({
        nickname,
        email,
        avatar,
        joined_at: new Date().toISOString()
    });
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2));

    // Здесь можно подключить автоматическую проверку оплаты через TronScan API

    res.json({
        success: true,
        message: "Игрок зарегистрирован. Для участия переведи 1 USDT (TRC-20).",
        wallet: process.env.WALLET_ADDRESS
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});