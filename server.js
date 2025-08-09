// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;
const BANK_ADDRESS = 'TX5iuanUcs1YubXrFyDtM3L7Jvhr4vWyij';

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(express.static(__dirname));            // отдаём index.html и прочие страницы
app.use('/public', express.static(path.join(__dirname, 'public')));

const playersFile  = path.join(__dirname, 'players.json');
const winnersFile  = path.join(__dirname, 'winners.json');

// helpers
const readJSON = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')||'[]') : []);
const writeJSON = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2));
if (!fs.existsSync(playersFile)) writeJSON(playersFile, []);
if (!fs.existsSync(winnersFile)) writeJSON(winnersFile, []);

// ===== API =====

// сохранить профиль сразу при переходе на оплату
app.post('/api/save-user', (req, res) => {
  const { nickname, email, avatar } = req.body || {};
  if (!nickname || !email) return res.status(400).json({ ok:false, error:'nickname/email required' });
  const players = readJSON(playersFile);

  // если уже есть такой email+nick — не дублируем
  const exists = players.find(p => p.email===email && p.nickname===nickname);
  if (!exists) {
    players.push({
      id: Date.now().toString(36),
      nickname, email,
      avatar: avatar || 'public/logo.png',
      paid: true,                   // пока принимаем как оплаченного (MVP)
      createdAt: new Date().toISOString()
    });
    writeJSON(playersFile, players);
  }
  res.json({ ok:true });
});

// статистика для главной
app.get('/api/stats', (req, res) => {
  const players = readJSON(playersFile);
  res.json({ players: players.length });
});

// имитация банка (MVP): берём кол-во оплаченных * 1 USDT и отдаём половину
app.get('/api/bank', (req, res) => {
  const players = readJSON(playersFile);
  const total = players.filter(p => p.paid).length * 1; // 1 USDT с участника
  const half = Math.floor(total * 0.5 * 100) / 100;
  res.json({ address: BANK_ADDRESS, total, half });
});

// последний победитель
app.get('/api/latest-winner', (req, res) => {
  const winners = readJSON(winnersFile);
  res.json(winners[winners.length - 1] || {});
});

// список победителей
app.get('/api/winners', (req, res) => {
  res.json(readJSON(winnersFile));
});

// ручной запуск ритуала (для теста)
app.post('/api/ritual-now', (req, res) => {
  const result = runRitual();
  if (!result) return res.status(400).json({ ok:false, error:'no eligible players' });
  res.json({ ok:true, winner: result });
});

// ===== РИТУАЛ =====
function runRitual() {
  const players = readJSON(playersFile).filter(p => p.paid);
  if (!players.length) return null;

  const rnd = players[Math.floor(Math.random() * players.length)];
  const bank = players.length * 1;                 // MVP банк
  const bankHalf = Math.floor(bank * 0.5 * 100) / 100;

  const winners = readJSON(winnersFile);
  const entry = {
    id: Date.now().toString(36),
    nickname: rnd.nickname,
    email: rnd.email,
    avatar: rnd.avatar || 'public/logo.png',
    bankHalf,
    date: new Date().toISOString()
  };
  winners.push(entry);
  writeJSON(winnersFile, winners);
  return entry;
}

// расписание: каждое воскресенье в 12:00 по МСК
// МСК = UTC+3. Крон берёт время сервера. Проще — запускать на сервере с TZ=Europe/Moscow
cron.schedule('0 12 * * 0', () => {
  try { runRitual(); } catch(e){ console.error('ritual error:', e); }
}, { timezone: 'Europe/Moscow' });

app.listen(PORT, () => console.log(`OneDollarCult API on http://localhost:${PORT}`));
