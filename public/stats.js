async function updateStats(){
  const playersEl = document.getElementById('stat-players');
  const bankEl = document.getElementById('stat-bank');
  const lw = document.getElementById('latest-winner');

  // дефолт
  if(playersEl) playersEl.textContent = (window.I18N?.t?.('players_in',{n:0})) || '0 players';
  if(bankEl) bankEl.textContent = (window.I18N?.t?.('bank_in',{n:0})) || '0 USDT';
  if(lw) lw.textContent = (window.I18N?.t?.('latest_wait')) || 'Waiting...';

  if(location.protocol === 'file:') return;

  try{
    const [stats, bank, latest] = await Promise.all([
      safeFetchJSON('/api/stats'),
      safeFetchJSON('/api/bank'),
      safeFetchJSON('/api/latest-winner').catch(()=>({})) // может отсутствовать
    ]);

    const isDemo = !!(stats && stats.demo);

    if(playersEl){
      const txt = window.I18N.t('players_in', {n: stats?.players ?? 0}) + (isDemo ? ' (демо)' : '');
      playersEl.textContent = txt;
    }
    if(bankEl){
      const n = bank?.half ?? 0;
      const txt = window.I18N.t('bank_in', {n}) + (isDemo ? ' (демо)' : '');
      bankEl.textContent = txt;
    }
    if(lw){
      lw.textContent = latest?.nickname ? `${latest.nickname}` : window.I18N.t('latest_wait');
    }
  }catch(e){
    console.warn('stats fallback:', e);
  }
}
