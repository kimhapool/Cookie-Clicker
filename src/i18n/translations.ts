export type GameLanguage = "ko" | "en" | "ja" | "zh" | "ar" | "de" | "ru";

type Labels = {
  home: string;
  draw: string;
  inventory: string;
  automation: string;
  exchange: string;
  upgrades: string;
  achievements: string;
  tapCookie: string;
  offline: string;
  claim: string;
  todayOven: string;
};

export const labels: Record<GameLanguage, Labels> = {
  ko: {
    home: "홈",
    draw: "뽑기",
    inventory: "인벤토리",
    automation: "자동화",
    exchange: "교환",
    upgrades: "강화",
    achievements: "도전과제",
    tapCookie: "쿠키를 눌러 굽기",
    offline: "오프라인 보상",
    claim: "받기",
    todayOven: "오늘의 오븐",
  },
  en: {
    home: "Home",
    draw: "Draw",
    inventory: "Inventory",
    automation: "Auto",
    exchange: "Exchange",
    upgrades: "Upgrades",
    achievements: "Achievements",
    tapCookie: "Tap to bake",
    offline: "Offline reward",
    claim: "Claim",
    todayOven: "Today's oven",
  },
  ja: {
    home: "ホーム",
    draw: "ガチャ",
    inventory: "インベントリ",
    automation: "自動化",
    exchange: "交換",
    upgrades: "強化",
    achievements: "実績",
    tapCookie: "クッキーをタップ",
    offline: "オフライン報酬",
    claim: "受取",
    todayOven: "今日のオーブン",
  },
  zh: {
    home: "主页",
    draw: "抽取",
    inventory: "背包",
    automation: "自动化",
    exchange: "兑换",
    upgrades: "强化",
    achievements: "成就",
    tapCookie: "点击烘焙",
    offline: "离线奖励",
    claim: "领取",
    todayOven: "今日烤炉",
  },
  ar: {
    home: "الرئيسية",
    draw: "سحب",
    inventory: "الحقيبة",
    automation: "تلقائي",
    exchange: "تبادل",
    upgrades: "ترقية",
    achievements: "إنجازات",
    tapCookie: "المس الكعكة",
    offline: "مكافأة غير متصل",
    claim: "استلام",
    todayOven: "فرن اليوم",
  },
  de: {
    home: "Start",
    draw: "Ziehen",
    inventory: "Inventar",
    automation: "Automatik",
    exchange: "Tausch",
    upgrades: "Upgrades",
    achievements: "Erfolge",
    tapCookie: "Keks antippen",
    offline: "Offline-Belohnung",
    claim: "Abholen",
    todayOven: "Ofen des Tages",
  },
  ru: {
    home: "Главная",
    draw: "Призыв",
    inventory: "Инвентарь",
    automation: "Авто",
    exchange: "Обмен",
    upgrades: "Улучшения",
    achievements: "Достижения",
    tapCookie: "Нажмите на печенье",
    offline: "Офлайн-награда",
    claim: "Получить",
    todayOven: "Печь дня",
  },
};
