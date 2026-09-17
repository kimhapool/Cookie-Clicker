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

type PageText = {
  drawTitle: string;
  basic: string;
  premium: string;
  trait: string;
  drawOnce: string;
  drawTen: string;
  drawAll: string;
  odds: string;
  confirm: string;
  close: string;
  buy: string;
  sell: string;
  equip: string;
  fuse: string;
  dismantle: string;
  ascending: string;
  descending: string;
  rebirth: string;
  active: string;
  idle: string;
};

export const pageText: Record<GameLanguage, PageText> = {
  ko: { drawTitle: "오븐 뽑기", basic: "기본", premium: "프리미엄", trait: "특성", drawOnce: "1회 뽑기", drawTen: "10회 뽑기", drawAll: "전부 뽑기", odds: "확률 보기", confirm: "확인", close: "닫기", buy: "구매", sell: "판매", equip: "장착", fuse: "융합", dismantle: "분해", ascending: "등급 오름차순", descending: "등급 내림차순", rebirth: "환생", active: "활성", idle: "대기" },
  en: { drawTitle: "Oven Draw", basic: "Basic", premium: "Premium", trait: "Trait", drawOnce: "Draw 1", drawTen: "Draw 10", drawAll: "Draw All", odds: "View Odds", confirm: "Confirm", close: "Close", buy: "Buy", sell: "Sell", equip: "Equip", fuse: "Fuse", dismantle: "Dismantle", ascending: "Rarity: Low", descending: "Rarity: High", rebirth: "Rebirth", active: "Active", idle: "Idle" },
  ja: { drawTitle: "オーブンガチャ", basic: "基本", premium: "プレミアム", trait: "特性", drawOnce: "1回引く", drawTen: "10回引く", drawAll: "すべて引く", odds: "確率を見る", confirm: "確認", close: "閉じる", buy: "購入", sell: "売却", equip: "装備", fuse: "融合", dismantle: "分解", ascending: "レア度 昇順", descending: "レア度 降順", rebirth: "転生", active: "有効", idle: "待機" },
  zh: { drawTitle: "烤炉抽取", basic: "基础", premium: "高级", trait: "特性", drawOnce: "抽取 1 次", drawTen: "抽取 10 次", drawAll: "全部抽取", odds: "查看概率", confirm: "确认", close: "关闭", buy: "购买", sell: "出售", equip: "装备", fuse: "融合", dismantle: "分解", ascending: "稀有度升序", descending: "稀有度降序", rebirth: "转生", active: "生效中", idle: "待命" },
  ar: { drawTitle: "سحب الفرن", basic: "أساسي", premium: "مميز", trait: "سمة", drawOnce: "سحب مرة", drawTen: "سحب 10", drawAll: "سحب الكل", odds: "عرض الاحتمالات", confirm: "تأكيد", close: "إغلاق", buy: "شراء", sell: "بيع", equip: "تجهيز", fuse: "دمج", dismantle: "تفكيك", ascending: "الندرة تصاعديا", descending: "الندرة تنازليا", rebirth: "ولادة جديدة", active: "نشط", idle: "انتظار" },
  de: { drawTitle: "Ofen-Ziehung", basic: "Basis", premium: "Premium", trait: "Merkmal", drawOnce: "1 Ziehung", drawTen: "10 Ziehungen", drawAll: "Alle ziehen", odds: "Chancen", confirm: "Bestätigen", close: "Schließen", buy: "Kaufen", sell: "Verkaufen", equip: "Ausrüsten", fuse: "Verschmelzen", dismantle: "Zerlegen", ascending: "Seltenheit auf", descending: "Seltenheit ab", rebirth: "Wiedergeburt", active: "Aktiv", idle: "Bereit" },
  ru: { drawTitle: "Призыв печи", basic: "Обычный", premium: "Премиум", trait: "Свойство", drawOnce: "Призвать 1", drawTen: "Призвать 10", drawAll: "Призвать всё", odds: "Шансы", confirm: "Подтвердить", close: "Закрыть", buy: "Купить", sell: "Продать", equip: "Надеть", fuse: "Слить", dismantle: "Разобрать", ascending: "Редкость по возр.", descending: "Редкость по убыв.", rebirth: "Перерождение", active: "Активно", idle: "Ожидание" },
};

type HomeText = {
  click: string; rebirth: string; doublePotion: string; feverTime: string;
  mail: string; missions: string; odds: string; ownedOvens: string;
  chips: string; buff: string; waiting: string; workshop: string;
  todayOvenSub: string; auto: string;
};
export const homeText: Record<GameLanguage, HomeText> = {
  ko: { click:"클릭", rebirth:"환생", doublePotion:"더블 포션", feverTime:"피버 타임", mail:"우편", missions:"미션", odds:"확률", ownedOvens:"보유 오븐", chips:"초코칩", buff:"버프", waiting:"대기", workshop:"쿠키 작업대", todayOvenSub:"오늘의 오븐을 확인하세요", auto:"자동" },
  en: { click:"Tap", rebirth:"Rebirth", doublePotion:"Double Potion", feverTime:"Fever Time", mail:"Mail", missions:"Missions", odds:"Odds", ownedOvens:"Ovens", chips:"Choco Chips", buff:"Buff", waiting:"Idle", workshop:"Cookie Workshop", todayOvenSub:"See today's oven", auto:"Auto" },
  ja: { click:"タップ", rebirth:"転生", doublePotion:"ダブルポーション", feverTime:"フィーバータイム", mail:"メール", missions:"ミッション", odds:"確率", ownedOvens:"所持オーブン", chips:"チョコチップ", buff:"バフ", waiting:"待機", workshop:"クッキー作業台", todayOvenSub:"今日のオーブンを確認", auto:"自動" },
  zh: { click:"点击", rebirth:"转生", doublePotion:"双倍药水", feverTime:"狂热时间", mail:"邮件", missions:"任务", odds:"概率", ownedOvens:"拥有烤炉", chips:"巧克力筹码", buff:"增益", waiting:"待命", workshop:"曲奇工坊", todayOvenSub:"查看今日烤炉", auto:"自动" },
  ar: { click:"نقر", rebirth:"ولادة جديدة", doublePotion:"جرعة مضاعفة", feverTime:"وقت الحمى", mail:"البريد", missions:"المهام", odds:"الاحتمالات", ownedOvens:"الأفران", chips:"رقائق الشوكولاتة", buff:"تعزيز", waiting:"انتظار", workshop:"ورشة الكعك", todayOvenSub:"تحقق من فرن اليوم", auto:"تلقائي" },
  de: { click:"Klick", rebirth:"Wiedergeburt", doublePotion:"Doppeltrank", feverTime:"Fieberzeit", mail:"Post", missions:"Missionen", odds:"Chancen", ownedOvens:"Öfen", chips:"Schoko-Chips", buff:"Bonus", waiting:"Bereit", workshop:"Keks-Werkstatt", todayOvenSub:"Ofen des Tages ansehen", auto:"Auto" },
  ru: { click:"Нажатие", rebirth:"Перерождение", doublePotion:"Двойное зелье", feverTime:"Время лихорадки", mail:"Почта", missions:"Задания", odds:"Шансы", ownedOvens:"Печи", chips:"Шоко-чипы", buff:"Бафф", waiting:"Ожидание", workshop:"Кондитерская", todayOvenSub:"Посмотреть печь дня", auto:"Авто" },
};
