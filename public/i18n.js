// public/i18n.js — единый i18n для всех страниц (index/join/payment/rules/philosophy/winners)

(() => {
  const DICTS = {
    ru: {
      // Навигация / шапка
      nav_home: "Главная",
      nav_rules: "Правила",
      nav_winners: "Победители",
      nav_philosophy: "Философия",
      lang_label: "Язык",

      // Главная
      title_main: "OneDollarCult",
      slogan: "Один доллар. Один шанс. Один победитель.",
      btn_send1: "Кинуть $1",
      till_ritual: "До ритуала:",
      players_in: "👁 В игре: {n} игроков",
      bank_in: "💰 В банке: {n} USDT",
      bank_hint: "Победитель получит 50% от банка",
      latest_winner: "👑 Победитель прошлой недели:",
      latest_wait: "Ожидание ритуала...",
      next_ritual_prefix: "Ближайший ритуал:",
      next_ritual_tz: "(UTC+3)",

      // Регистрация
      join_title: "Регистрация",
      ph_nick: "Никнейм",
      ph_email: "Email",

      // Оплата
      pay_title: "Оплати 1 USDT (TRC-20)",
      pay_send_exact: "Отправь ровно",
      pay_to_addr: "на адрес:",
      pay_hint: "Отсканируй QR или нажми на адрес, чтобы скопировать. После перевода нажми кнопку ниже.",
      btn_check: "Я перевёл(а) — проверить",
      copied: "Адрес скопирован",
      pay_ok: "✅ Оплата найдена. Ты в игре!",
      pay_fail: "❌ Оплата не найдена",
      pay_err: "Ошибка соединения. Попробуй ещё раз.",

      // Правила
      rules_title: "Кодекс Культа",
      rule_1: "Войти в Культ можно только один раз, выйти из него — можно только с наградой. Присоединившись, ты участвуешь в Ритуале каждое воскресенье, пока не получишь 50% от банка.",
      rule_2: "Один доллар — один шанс. Брось ровно 1 USDT (TRC-20). Больше или меньше — не принимается. Но ты можешь участвовать несколько раз, регистрируя разные имена (с одной почтой) — так твои шансы растут.",
      rule_3: "Культ — не игра. Это не лотерея и не гемблинг. OneDollarCult — социальный эксперимент о доверии, случайности и возвращении.",
      rule_4: "Ритуал отбора — каждое воскресенье в 12:00 (UTC+3). Время отображается локально на таймере.",
      rule_5: "Половина возвращается. Победитель получает 50% банка. Вторая половина остаётся в фонде Культа.",
      rule_6: "Чистая репутация. Подтверждаются только переводы ровно 1 USDT на официальный адрес Культа.",

      // Философия
      ph_title: "Легенда о Монете",
      ph_p1: "Говорят, жил мудрец, который мечтал о невозможном: однажды каждый житель Земли отдаст ему по одной монете. Он не знал, зачем ему эти монеты — он знал только, что в тот день поймёт смысл.",
      ph_p2: "И однажды Бог услышал его. Люди из всех стран мира, не сговариваясь, отправили по монете. Мудрец стал богат — не золотом, а отражением мира.",
      ph_p3: "Тогда он вернул половину обратно. Истина — не в получении, а в возвращении. Так родился OneDollarCult.",

      // Победители
      winners_title: "Победители Ритуалов",
      total_winners: "Всего победителей: {n}",
      col_avatar: "Аватар",
      col_user: "Участник",
      col_amount: "Сумма выигрыша",
      col_date: "Дата",
      winners_none: "Ещё не было ритуалов.",
      winners_error: "Ошибка загрузки",
      refresh_btn: "Обновить"
    },

    en: {
      // Nav / header
      nav_home: "Home",
      nav_rules: "Rules",
      nav_winners: "Winners",
      nav_philosophy: "Philosophy",
      lang_label: "Language",

      // Index
      title_main: "OneDollarCult",
      slogan: "One dollar. One chance. One winner.",
      btn_send1: "Send $1",
      till_ritual: "Until the ritual:",
      players_in: "👁 In game: {n} players",
      bank_in: "💰 Bank: {n} USDT",
      bank_hint: "Winner gets 50% of the bank",
      latest_winner: "👑 Last week's winner:",
      latest_wait: "Waiting for the ritual...",
      next_ritual_prefix: "Next ritual:",
      next_ritual_tz: "(UTC+3)",

      // Join
      join_title: "Registration",
      ph_nick: "Nickname",
      ph_email: "Email",

      // Payment
      pay_title: "Pay 1 USDT (TRC-20)",
      pay_send_exact: "Send exactly",
      pay_to_addr: "to address:",
      pay_hint: "Scan the QR or click the address to copy. After sending, press the button below.",
      btn_check: "I paid — check",
      copied: "Address copied",
      pay_ok: "✅ Payment found. You are in!",
      pay_fail: "❌ Payment not found",
      pay_err: "Connection error. Try again.",

      // Rules
      rules_title: "Cult Code",
      rule_1: "Join once — leave with a reward. Once joined, you take part every Sunday until you receive 50% of the bank.",
      rule_2: "One dollar — one chance. Send exactly 1 USDT (TRC-20). You may register multiple names (same email) to increase your odds.",
      rule_3: "Not gambling. OneDollarCult is a social experiment about trust, randomness and return.",
      rule_4: "Ritual is every Sunday at 12:00 (UTC+3). The timer shows your local countdown.",
      rule_5: "Half is returned. The winner gets 50% of the bank; the rest stays in the Cult fund.",
      rule_6: "Clean reputation. Only transfers of exactly 1 USDT to the official address are confirmed.",

      // Philosophy
      ph_title: "The Legend of the Coin",
      ph_p1: "A sage dreamed that one day every person on Earth would give him one coin.",
      ph_p2: "One day the heavens listened. People from every land sent a coin. He grew rich — not in gold, but in reflection.",
      ph_p3: "He returned half. Truth lies not in taking, but in returning. Thus OneDollarCult was born.",

      // Winners
      winners_title: "Ritual Winners",
      total_winners: "Total winners: {n}",
      col_avatar: "Avatar",
      col_user: "Participant",
      col_amount: "Prize amount",
      col_date: "Date",
      winners_none: "No rituals yet.",
      winners_error: "Load error",
      refresh_btn: "Refresh"
    }
  };

  function chooseInitialLang() {
    const saved = localStorage.getItem('lang');
    if (saved && DICTS[saved]) return saved;
    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.startsWith('ru') ? 'ru' : 'en';
  }

  function t(key, vars) {
    const d = DICTS[window.LANG] || DICTS.en;
    let s = d[key] || key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }

  function apply() {
    // текстовые узлы
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key, el.dataset || {});
    });
    // плейсхолдеры
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      el.setAttribute('placeholder', t(key));
    });
  }

  function setLang(lang) {
    if (!DICTS[lang]) return;
    window.LANG = lang;
    localStorage.setItem('lang', lang);
    apply();
    window.dispatchEvent(new CustomEvent('langchange'));
  }

  // export
  window.LANG = chooseInitialLang();
  window.I18N = { setLang, t, apply, lang: () => window.LANG };

  document.addEventListener('DOMContentLoaded', apply);
})();
