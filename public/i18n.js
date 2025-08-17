// public/i18n.js
(() => {
  const DICT = {
    ru: {
      // nav & common
      nav_home: "Главная",
      nav_rules: "Правила",
      nav_winners: "Победители",
      nav_philosophy: "Философия",
      lang_label: "Язык",

      // home
      title_main: "OneDollarCult",
      slogan: "Один доллар. Один шанс. Один победитель.",
      btn_send1: "Кинуть $1",
      till_ritual: "До ритуала:",
      players_in: (p) => `👁 В игре: ${p.n} игроков`,
      bank_hint: "Победитель получит 50% от банка",
      bank_in: (p) => `💰 В банке: ${p.n} USDT`,
      latest_winner: "👑 Победитель прошлой недели:",
      latest_wait: "Ожидание ритуала...",
      next_ritual_prefix: "Ближайший ритуал:",
      next_ritual_tz: "(UTC+3)",

      // rules
      rules_title: "Правила — OneDollarCult",
      rules_h1: "Правила",
      rules_1: "Кинуть можно ровно $1 в USDT (TRC-20). Банковские карты и другие сети не принимаются.",
      rules_2: "Можно отправить несколько раз — каждый $1 считается отдельной попыткой. Email указывайте один и тот же.",
      rules_3: "Ритуал проводится по воскресеньям в 18:00 (UTC+3). Победитель выбирается случайно из всех участников недели.",
      rules_4: "Победитель получает 50% банка. Оставшиеся 50% идут на поддержание культа и проекта.",
      rules_5: "После ритуала банк обнуляется, начинается новая неделя и новый сбор.",
      rules_6: "Участвуя, вы подтверждаете, что понимаете правила и необратимость криптоплатежей.",

      // winners
      winners_title: "Победители — OneDollarCult",
      refresh_btn: "Обновить",
      total_winners: (p) => `Всего победителей: ${p.n}`,
      col_avatar: "Аватар",
      col_user: "Участник",
      col_amount: "Сумма выигрыша",
      col_date: "Дата",
      winners_none: "Ещё не было ритуалов.",

      // philosophy
      ph_title: "Легенда о Монете",
      ph_p1: "Говорят, жил мудрец, который мечтал о невозможном: однажды каждый житель Земли отдаст ему по одной монете.",
      ph_p2: "И однажды Бог услышал его. Люди из всех стран мира, не сговариваясь, отправили по монете.",
      ph_p3: "Тогда он вернул половину обратно. Истина — не в получении, а в возвращении. Так родился OneDollarCult."
    },
    en: {
      // nav & common
      nav_home: "Home",
      nav_rules: "Rules",
      nav_winners: "Winners",
      nav_philosophy: "Philosophy",
      lang_label: "Language",

      // home
      title_main: "OneDollarCult",
      slogan: "One dollar. One chance. One winner.",
      btn_send1: "Join for $1",
      till_ritual: "Until the ritual:",
      players_in: (p) => `👁 In game: ${p.n} players`,
      bank_hint: "Winner gets 50% of the bank",
      bank_in: (p) => `💰 Bank: ${p.n} USDT`,
      latest_winner: "👑 Last week's winner:",
      latest_wait: "Waiting for the ritual...",
      next_ritual_prefix: "Next ritual:",
      next_ritual_tz: "(UTC+3)",

      // rules
      rules_title: "Rules — OneDollarCult",
      rules_h1: "Rules",
      rules_1: "You can send exactly $1 in USDT (TRC-20). Cards and other networks are not accepted.",
      rules_2: "You may send multiple times — each $1 counts as a separate entry. Use the same email.",
      rules_3: "The ritual is held on Sundays at 18:00 (UTC+3). A winner is randomly selected among the week’s participants.",
      rules_4: "The winner receives 50% of the bank. The remaining 50% sustains the Cult and the project.",
      rules_5: "After the ritual the bank resets and a new week starts.",
      rules_6: "By participating you acknowledge the rules and the irreversibility of crypto transfers.",

      // winners
      winners_title: "Winners — OneDollarCult",
      refresh_btn: "Refresh",
      total_winners: (p) => `Total winners: ${p.n}`,
      col_avatar: "Avatar",
      col_user: "Participant",
      col_amount: "Prize amount",
      col_date: "Date",
      winners_none: "No rituals yet.",

      // philosophy
      ph_title: "The Legend of the Coin",
      ph_p1: "They say a sage dreamed the impossible: one day every person would give him a single coin.",
      ph_p2: "One day the heavens heard. People everywhere sent a coin.",
      ph_p3: "Then he returned half. Truth is not in taking, but returning. Thus OneDollarCult was born."
    }
  };

  const LS_KEY = "odc_lang";
  let LANG = (localStorage.getItem(LS_KEY) || (navigator.language||"ru").toLowerCase().startsWith("en") ? "en" : "ru");
  if (!["ru","en"].includes(LANG)) LANG = "ru";

  function format(val, params) {
    return typeof val === "function" ? val(params||{}) : val;
  }

  function setText(el, key) {
    const dict = DICT[LANG] || {};
    const val = dict[key];
    if (val === undefined || val === null) return; // НЕ трогаем, если ключа нет
    el.textContent = format(val, { n: el.dataset.n ? Number(el.dataset.n) : undefined });
  }

  function setPlaceholder(el, key) {
    const dict = DICT[LANG] || {};
    const val = dict[key];
    if (val === undefined || val === null) return;
    el.setAttribute("placeholder", format(val, {}));
  }

  function applyLang() {
    document.querySelectorAll("[data-i18n]").forEach(el => setText(el, el.getAttribute("data-i18n")));
    document.querySelectorAll("[data-i18n-ph]").forEach(el => setPlaceholder(el, el.getAttribute("data-i18n-ph")));
    document.documentElement.lang = LANG;
    window.dispatchEvent(new Event("langchange"));
  }

  window.I18N = {
    setLang(lc) { if (["ru","en"].includes(lc)) { LANG = lc; localStorage.setItem(LS_KEY, lc); applyLang(); } },
    lang() { return LANG; },
    t(key, params) {
      const dict = DICT[LANG] || {};
      const val = dict[key];
      return val === undefined ? key : format(val, params);
    }
  };

  // выставить селекторы языка, если есть
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#langSel, #lang").forEach(sel => {
      sel.value = LANG;
      sel.addEventListener("change", e => window.I18N.setLang(e.target.value));
    });
    applyLang();
  });
})();
