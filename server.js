// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Читаем адрес кошелька из переменной окружения
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
if (!WALLET_ADDRESS) {
    console.error("❌ WALLET_ADDRESS не задан в переменных окружения");
    process.exit(1);
}

// Включаем CORS (разрешаем Tilda)
app.use(cors({
    origin: ['https://onedollarcult.tilda.ws', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Для парсинга JSON
app.use(express.json());

// Настраиваем multer для загрузки аватарок
const upload = multer({ dest: 'uploads/' });

// Папка для хранения участников
const playersFile = path.join(__dirname, 'players.json');
if (!fs.existsSync(playersFile)) {
    fs.writeFileSync(playersFile, JSON.stringify([]));
}

// Маршрут для регистрации
app.post('/api/join', upload.single('avatar'), async (req, res) => {
    try {
        const { nickname, email } = req.body;
        const avatarPath = req.file ? req.file.path : null;

        if (!nickname || !email) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Сохраняем участника в players.json со статусом "ожидает оплаты"
        let players = JSON.parse(fs.readFileSync(playersFile));
        const player = {
            id: Date.now(),
            nickname,
            email,
            avatar: avatarPath,
            paid: false
        };
        players.push(player);
        fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));

        // Отдаём ссылку с инструкцией на оплату 1 USDT
        const payment_url = `https://tronscan.org/#/address/${WALLET_ADDRESS}`;

        res.json({ payment_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Маршрут для проверки оплаты
app.get('/api/check-payment/:id', async (req, res) => {
    try {
        const playerId = parseInt(req.params.id);
        let players = JSON.parse(fs.readFileSync(playersFile));
        const player = players.find(p => p.id === playerId);
        if (!player) return res.status(404).json({ error: 'Player not found' });

        // Запрос к TronScan API для проверки транзакций
        const resp = await axios.get(`https://apilist.tronscanapi.com/api/transfer?sort=-timestamp&count=true&limit=20&start=0&address=${WALLET_ADDRESS}&token=usdt`, {
            headers: { 'Accept': 'application/json' }
        });

        const transactions = resp.data.token_transfers || [];
        const paid = transactions.some(tx =>
            tx.to_address === WALLET_ADDRESS &&
            tx.amount === 1 &&
            tx.tokenInfo.symbol.toLowerCase() === 'usdt'
        );

        if (paid) {
            player.paid = true;
            fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
            return res.json({ status: 'paid' });
        }

        res.json({ status: 'pending' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Payment check failed' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💰 Wallet address: ${WALLET_ADDRESS}`);
});
