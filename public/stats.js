// public/stats.js
function msToTime(ms){
  const s=Math.max(0,Math.floor(ms/1000));
  const d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), ss=s%60;
  return `${d}д ${h}ч ${m}м ${ss}с`;
}

// 12:00 MSK = 09:00 UTC
function nextSundayMSKNoonUTC(){
  const now=new Date();
  const day=now.getUTCDay(); // 0=Sun
  let addDays=(7-day)%7;
  const target=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),9,0,0));
  target.setUTCDate(target.getUTCDate()+addDays);
  if(now.getUTCDay()===0 && now.getUTCHours()>=9) target.setUTCDate(target.getUTCDate()+7);
  return target;
}

function fmtMSK(dtUTC){
  const loc = (window.I18N?.lang?.() === 'ru') ? 'ru-RU' : 'en-US';
  return dtUTC.toLocaleString(loc, {
    timeZone:'Europe/Moscow',
    weekday:'long', year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
}

async function safeFetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

function paintFooter(target){
  const footer=document.getElementById('ritual-time');
  if(!footer) return;
  const prefix = window.I18N?.t?.('next_ritual_prefix') || 'Next ritual:';
  const tz = window.I18N?.t?.('next_ritual_tz') || '(UTC+3)';
  footer.textContent = `${prefix} ${fmtMSK(target)} ${tz}`;
}

async function updateStats(){
  const playersEl = document.getElementById('stat-players');
  const bankEl = document.getElementById('stat-bank');
  const lw = document.getElementById('latest-winner');

  // дефолт сразу (чтобы не было «—»)
  if(playersEl) playersEl.textContent = (window.I18N?.t?.('players_in',{n:0})) || '0 players';
  if(bankEl) bankEl.textContent = (window.I18N?.t?.('bank_in',{n:0})) || '0 USDT';
  if(lw) lw.textContent = (window.I18N?.t?.('latest_wait')) || 'Waiting...';

  if(location.protocol === 'file:') return; // офлайн-режим (демо)

  try{
    const [stats, bank, latest] = await Promise.all([
      safeFetchJSON('/api/stats'),
      safeFetchJSON('/api/bank'),
      safeFetchJSON('/api/latest-winner')
    ]);

    if(playersEl) playersEl.textContent = window.I18N.t('players_in', {n: stats?.players ?? 0});
    if(bankEl) bankEl.textContent = window.I18N.t('bank_in', {n: bank?.half ?? 0});
    if(lw) lw.textContent = latest?.nickname ? `${latest.nickname}` : window.I18N.t('latest_wait');
  }catch(e){
    // остаёмся на дефолтах
    console.warn('stats fallback:', e);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const target=nextSundayMSKNoonUTC();
  paintFooter(target);
  const box=document.getElementById('countdown');
  const tick=()=>{ const left=target-new Date(); if(box) box.textContent = left>0 ? msToTime(left) : (window.I18N?.lang?.()==='ru'?'идёт ритуал...':'ritual in progress...'); };
  tick(); setInterval(tick,1000);

  updateStats();

  // переотрисовать при смене языка
  window.addEventListener('langchange', ()=>{
    paintFooter(target);
    updateStats();
  });
});
