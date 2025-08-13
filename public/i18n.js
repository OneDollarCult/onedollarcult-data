/* public/i18n.js — OneDollarCult
   Единый словарь RU/EN для всех страниц
   — обновляет элементы с [data-i18n] и [data-i18n-ph]
   — поддерживает {n} из data-n
   — корректно обновляет <title data-i18n="...">
   — I18N.lang(), I18N.setLang(), I18N.apply()
   — диспатчит window 'langchange'
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

      // Главная
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

      // Rules (обновлено: только USDT TRC-20)
      rules_title: "Правила — OneDollarCult",
      rules_h1: "Правила",
      rules_1: "OneDollarCult — культ одного доллара. На алтаре Главной страницы сияет кнопка «Кинуть $1».",
      rules_2: "Жертву можно принести только в USDT (TRC-20). Карты, банки и иные способы отвергнуты.",
      rules_3: "Сумма неизменна — ровно $1. Больше — нельзя. Но можно приносить дары несколько раз, указывая один и тот же email.",
      rules_4: "Каждое воскресенье в 18:00 (по МСК) Культ проводит Ритуал Избрания: из всех верных случайно выбирается один Избранник.",
      rules_5: "Избранник получает половину всего накопленного Банка. Другая половина остаётся Культу. После Ритуала Банк обнуляется.",
      rules_6: "Один доллар. Один шанс. Один победитель. Одна неделя. И так — бесконечно.",

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

      // Rules (updated: USDT TRC-20 only)
      rules_title: "Rules — OneDollarCult",
      rules_h1: "Rules",
      rules_1: "OneDollarCult is the cult of a single dollar. On the Home altar shines the “Join for $1” button.",
      rules_2: "The offering can be made only in USDT (TRC-20). Cards, banks, and other methods are rejected.",
      rules_3: "The amount is fixed — exactly $1. No more. You may give multiple times using the same email.",
      rules_4: "Every Sunday at 18:00 (MSK), the Cult holds the Ritual of Choosing: one Chosen is picked at random from all who gave.",
      rules_5: "The Chosen receives half of the total Bank. The other half remains with the Cult. After the Ritual, the Bank resets.",
      rules_6: "One dollar. One chance. One winner. One week. Forever.",

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

    // Тексты
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
        el.setAttribute("placeholder", out);
      } else {
        el.textContent = out;
      }
    });

    // Плейсхолдеры
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      const val = dict[key];
      if (val != null) el.setAttribute("placeholder", val);
    });

    // Синхронизация селекторов языка
    document.querySelectorAll("#langSel").forEach(s => { if (s.value !== lang) s.value = lang; });
  }

  const I18N = {
    dict: DICT,
    lang() { return w.LANG || "ru"; },
    setLang(lang) {
      try { localStorage.setItem("odc_lang", lang); } catch(e) {}
      w.LANG = lang;
      document.documentElement.lang = lang;
      apply(lang);
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
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => apply(w.LANG));
    } else {
      apply(w.LANG);
    }
  })();

  w.I18N = I18N;
})(window);
