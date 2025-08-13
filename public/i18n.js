/* public/i18n.js — OneDollarCult
   Единый словарь RU/EN для всех страниц: index, join, rules, winners, philosophy
   — обновляет элементы с [data-i18n]
   — поддерживает подстановку {n} из data-n
   — обновляет <title data-i18n="...">
   — даёт I18N.lang(), I18N.setLang(), I18N.apply()
   — диспатчит событие window 'langchange'
*/
(function (w) {
  const DICT = {
    ru: {
      // Навигация
      nav_home: "Главная",
      nav_rules: "Правила",
      nav_winners: "Победители",
      nav_philosophy: "Философия",
      lang_label: "Язык",

      // Главная (index)
      title_main: "OneDollarCult",
      slogan: "Один доллар. Один шанс. Один победитель.",
      btn_send1: "Кинуть $1",
      till_ritual: "⏳ До ритуала:",
      bank_hint: "Победитель получит 50% от банка",
      latest_winner: "👑 Победитель прошлой недели:",
      latest_wait: "Ожидание ритуала...",
      players_count: "В игре — {n}",
      bank_amount: "В банке — {n} USDT",

      // Join
      join_title: "Регистрация — OneDollarCult",
      join_h2: "Регистрация",
      ph_nick: "Никнейм",
      ph_email: "Email",
      btn_go_pay: "Кинуть $1",
      join_choose_file: "Выбери файл",
      join_no_file: "Файл не выбран",
      join_fill_alert: "Заполни ник и email",

      // Rules
      rules_title: "Правила — OneDollarCult",
      rules_h1: "Правила",
      rules_1: "Каждую неделю проходит один ритуал с одним победителем.",
      rules_2: "Вход — $1 в USDT (TRC-20). Половина банка уходит победителю.",
      rules_3: "До ритуала на главной виден таймер. После — имя победителя и сумма.",
      rules_4: "Факт участия фиксируется после подтверждения транзакции.",
      rules_5: "Рандомайзер выбирает победителя среди участников недели.",

      // Winners
      winners_title: "Победители — OneDollarCult",
      winners_h1: "Победители Ритуалов",
      total_winners: "Всего победителей: {n}",
      refresh_btn: "Обновить",
      col_avatar: "Аватар",
      col_user: "Участник",
      col_amount: "Сумма выигрыша",
      col_date: "Дата",
      winners_none: "Ещё не было ритуалов.",

      // Philosophy
      ph_title: "Легенда о Монете",
      ph_p1: "Говорят, жил мудрец, который мечтал о невозможном: однажды каждый житель Земли отдаст ему по одной монете. Он не знал, зачем ему эти монеты — он знал только, что в тот день поймёт смысл.",
      ph_p2: "И однажды Бог услышал его. Люди из всех стран мира, не сговариваясь, отправили по монете. Мудрец стал богат — не золотом, а отражением мира.",
      ph_p3: "Тогда он вернул половину обратно. Истина — не в получении, а в возвращении. Так родился OneDollarCult."
    },

    en: {
      // Navigation
      nav_home: "Home",
      nav_rules: "Rules",
      nav_winners: "Winners",
      nav_philosophy: "Philosophy",
      lang_label: "Language",

      // Index
      title_main: "OneDollarCult",
      slogan: "One dollar. One chance. One winner.",
      btn_send1: "Join for $1",
      till_ritual: "⏳ Time until ritual:",
      bank_hint: "Winner gets 50% of the bank",
      latest_winner: "👑 Last week's winner:",
      latest_wait: "Waiting for the ritual...",
      players_count: "Players — {n}",
      bank_amount: "Bank — {n} USDT",

      // Join
      join_title: "Join — OneDollarCult",
      join_h2: "Join",
      ph_nick: "Nickname",
      ph_email: "Email",
      btn_go_pay: "Join for $1",
      join_choose_file: "Choose file",
      join_no_file: "No file chosen",
      join_fill_alert: "Fill nickname and email",

      // Rules
      rules_title: "Rules — OneDollarCult",
      rules_h1: "Rules",
      rules_1: "There is one ritual every week with one winner.",
      rules_2: "Entry — $1 in USDT (TRC-20). Half of the pool goes to the winner.",
      rules_3: "Before the ritual the timer is shown on the home page. After — winner’s name and amount.",
      rules_4: "Participation is recorded after the transaction confirmation.",
      rules_5: "A randomizer picks the winner among the week’s participants.",

      // Winners
      winners_title: "Winners — OneDollarCult",
      winners_h1: "Ritual Winners",
      total_winners: "Total winners: {n}",
      refresh_btn: "Refresh",
      col_avatar: "Avatar",
      col_user: "Participant",
      col_amount: "Prize amount",
      col_date: "Date",
      winners_none: "No rituals yet.",

      // Philosophy
      ph_title: "The Legend of the Coin",
      ph_p1: "They say there was a sage who dreamed of the impossible: one day every person on Earth would give him a single coin. He didn’t know why he needed those coins—only that on that day he would understand the meaning.",
      ph_p2: "And one day God heard him. People from every country, without collusion, sent a coin. The sage became rich—not in gold, but in a reflection of the world.",
      ph_p3: "Then he returned half back. Truth lies not in receiving, but in giving. Thus OneDollarCult was born."
    }
  };

  function interpolate(str, n) {
    if (n == null) return str;
    return String(str).replace("{n}", n);
  }

  function apply(lang) {
    const dict = DICT[lang] || DICT.ru;

    // Проставляем тексты
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const n = el.getAttribute("data-n");
      const val = dict[key];
      if (val == null) return;

      const out = interpolate(val, n);
      if (el.tagName.toLowerCase() === "title") {
        document.title = out;               // для <title data-i18n="...">
      } else if (el.hasAttribute("data-i18n-ph")) {
        // для плейсхолдеров (если элемент одновременно помечен и data-i18n, и data-i18n-ph)
        el.setAttribute("placeholder", out);
      } else {
        el.textContent = out;
      }
    });

    // Плейсхолдеры (input[data-i18n-ph])
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      const val = dict[key];
      if (val != null) el.setAttribute("placeholder", val);
    });

    // Синхронизируем селекторы языка на странице
    document.querySelectorAll("#langSel").forEach(s => {
      if (s.value !== lang) s.value = lang;
    });
  }

  const I18N = {
    dict: DICT,
    lang() { return w.LANG || "ru"; },
    setLang(lang) {
      try { localStorage.setItem("odc_lang", lang); } catch(e) {}
      w.LANG = lang;
      document.documentElement.lang = lang;
      apply(lang);
      // Сообщаем странице, что язык поменялся (на случай локальных обработчиков)
      try { window.dispatchEvent(new Event("langchange")); } catch(e) {}
    },
    apply
  };

  // Инициализация
  (function initLang() {
    let start = "ru";
    try {
      const saved = localStorage.getItem("odc_lang");
      start = saved || ((navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en");
    } catch(e) {}
    w.LANG = w.LANG || start;
    document.addEventListener("DOMContentLoaded", () => apply(w.LANG));
  })();

  w.I18N = I18N;
})(window);
