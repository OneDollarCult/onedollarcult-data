// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;

// === ваш приёмный TRC-20 адрес USDT (куда платят) ===
const BANK_ADDRESS = 'TX5iuanUcs1YubXrFyDtM3L7Jvhr4vWyij';
// контракт USDT TRC-20
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

const playersFile  = path.join(__dirname, 'players.json');
const winnersFile  = path.join(__dirname, 'winners.json');
const paymentsFile = path.join(__dirname, 'payments.json'); // виденные tx

// helpers
const readJSON = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8') || '[]') : []);
const writeJSON = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2));

if (!fs.existsSync(playersFile))  writeJSON(playersFile,  []);
if (!fs.existsSync(winnersFile))  writeJSON(winnersFile,  []);
if (!fs.existsSync(paymentsFile)) writeJSON(paymentsFile, []);

// health
app.get('/healthz', (_,res)=>res.json({ok:true}));

// ===== API =====

// 1) Сохраняем профиль при заходе на оплату (без "paid")
app.post('/api/save-user', (req, res) => {
  const { nickname, email, avatar } = req.body || {};
  if (!nickname || !email) return res.status(400).json({ ok:false, error:'nickname/email required' });

  const players = readJSON(playersFile);
  players.push({
    id: Date.now().toString(36),
    nickname,
    email,
    avatar: avatar || 'public/logo.png',
    paid: false,                 // важное изменение (раньше было true в MVP)
    createdAt: new Date().toISOString()
  });
  writeJSON(playersFile, players);

  res.json({ ok:true });
});

// 2) Статистика (считаем только оплаченных)
app.get('/api/stats', (req, res) => {
  const players = readJSON(playersFile);
  res.json({ players: players.filter(p=>p.paid).length });
});

// 3) Банк (50% от суммы оплаченных * 1 USDT)
app.get('/api/bank', (req, res) => {
  const players = readJSON(playersFile);
  const total = players.filter(p => p.paid).length * 1;
  const half = Math.floor(total * 0.5 * 100) / 100;
  res.json({ address: BANK_ADDRESS, total, half });
});

// 4) Последний победитель
app.get('/api/latest-winner', (req, res) => {
  const winners = readJSON(winnersFile);
  res.json(winners[winners.length - 1] || {});
});

// 5) Список победителей
app.get('/api/winners', (req, res) => {
  res.json(readJSON(winnersFile));
});

// ===== Проверка входящих 1 USDT без адреса отправителя =====
//
// Логика:
// - тянем свежие входящие TRC20-транзакции USDT на наш BANK_ADDRESS
//   с TronScan публичного API
// - ищем платёж ровно на 1 USDT (USDT имеет 6 знаков после запятой => 1e6)
// - пропускаем уже "виденные" tx (payments.json)
// - если нашли новый — помечаем последнего НЕОПЛАЧЕННОГО игрока как paid=true
// - возвращаем результат
//
app.post('/api/check-payment', async (req, res) => {
  try {
    const apiUrl = `https://apilist.tronscanapi.com/api/token_trc20/transfers` +
      `?limit=50&toAddress=${BANK_ADDRESS}&contract_address=${USDT_CONTRACT}`;

    // Node 20+ имеет встроенный fetch
    const r = await fetch(encodeURI(apiUrl));
    if (!r.ok) throw new Error('TronScan API error');
    const data = await r.json();

    const seen = new Set(readJSON(paymentsFile));           // список txid, которые уже засчитали
    const ONE_USDT = 1_000_000;                              // 1 * 10^6
    const now = Date.now();

    // оставим только свежие (за последние 90 минут), к адресу BANK_ADDRESS
    const recent = (data?.token_transfers || []).filter(tx => {
      // на некоторых ответах поле decimal/quant равны строкам
      const value = Number(tx.quant || tx.value || 0);
      const to    = tx.to_address || tx.to || '';
      const ts    = Number(tx.block_ts || tx.timestamp || 0);
      const okAge = (now - ts) <= 90 * 60 * 1000; // 90 минут
      return to === BANK_ADDRESS && value === ONE_USDT && okAge;
    });

    // найдём первый "новый" tx
    const fresh = recent.find(tx => !seen.has(tx.transaction_id));
    if (!fresh) return res.json({ ok:false, found:false, reason:'not_found' });

    // помечаем tx как использованный
    seen.add(fresh.transaction_id);
    writeJSON(paymentsFile, Array.from(seen));

    // отмечаем последнего неоплаченного игрока как paid
    const players = readJSON(playersFile);
    const idx = [...players].reverse().findIndex(p => !p.paid);
    if (idx === -1) {
      return res.json({ ok:true, found:true, note:'no_unpaid_player', txid:fresh.transaction_id });
    }
    const realIndex = players.length - 1 - idx;
    players[realIndex].paid = true;
    players[realIndex].txid = fresh.transaction_id;
    players[realIndex].from = fresh.from_address || fresh.from || '';
    players[realIndex].paidAt = new Date().toISOString();
    writeJSON(playersFile, players);

    res.json({ ok:true, found:true, nickname: players[realIndex].nickname });
  } catch (e) {
    console.error('check-payment error:', e);
    res.status(500).json({ ok:false, error:'internal' });
  }
});

// ===== РИТУАЛ =====
function runRitual() {
  const players = readJSON(playersFile).filter(p => p.paid);
  if (!players.length) return null;

  const rnd = players[Math.floor(Math.random() * players.length)];
  const bank = players.length * 1;
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

// каждое воскресенье в 12:00 (UTC+3)
cron.schedule('0 12 * * 0', () => {
  try { runRitual(); } catch(e){ console.error('ritual error:', e); }
}, { timezone: 'Europe/Moscow' });

app.listen(PORT, () => console.log(`OneDollarCult API running on port ${PORT}`));