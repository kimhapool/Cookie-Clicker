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
  todayOvenSub: string; auto: string; use: string; active: string;
};
export const homeText: Record<GameLanguage, HomeText> = {
  ko: { click:"클릭", rebirth:"환생", doublePotion:"더블 포션", feverTime:"피버 타임", mail:"우편", missions:"미션", odds:"확률", ownedOvens:"보유 오븐", chips:"초코칩", buff:"버프", waiting:"대기", workshop:"쿠키 작업대", todayOvenSub:"오늘의 오븐을 확인하세요", auto:"자동", use:"사용", active:"진행 중" },
  en: { click:"Tap", rebirth:"Rebirth", doublePotion:"Double Potion", feverTime:"Fever Time", mail:"Mail", missions:"Missions", odds:"Odds", ownedOvens:"Ovens", chips:"Choco Chips", buff:"Buff", waiting:"Idle", workshop:"Cookie Workshop", todayOvenSub:"See today's oven", auto:"Auto", use:"Use", active:"Active" },
  ja: { click:"タップ", rebirth:"転生", doublePotion:"ダブルポーション", feverTime:"フィーバータイム", mail:"メール", missions:"ミッション", odds:"確率", ownedOvens:"所持オーブン", chips:"チョコチップ", buff:"バフ", waiting:"待機", workshop:"クッキー作業台", todayOvenSub:"今日のオーブンを確認", auto:"自動", use:"使用", active:"発動中" },
  zh: { click:"点击", rebirth:"转生", doublePotion:"双倍药水", feverTime:"狂热时间", mail:"邮件", missions:"任务", odds:"概率", ownedOvens:"拥有烤炉", chips:"巧克力筹码", buff:"增益", waiting:"待命", workshop:"曲奇工坊", todayOvenSub:"查看今日烤炉", auto:"自动", use:"使用", active:"进行中" },
  ar: { click:"نقر", rebirth:"ولادة جديدة", doublePotion:"جرعة مضاعفة", feverTime:"وقت الحمى", mail:"البريد", missions:"المهام", odds:"الاحتمالات", ownedOvens:"الأفران", chips:"رقائق الشوكولاتة", buff:"تعزيز", waiting:"انتظار", workshop:"ورشة الكعك", todayOvenSub:"تحقق من فرن اليوم", auto:"تلقائي", use:"استخدم", active:"نشط" },
  de: { click:"Klick", rebirth:"Wiedergeburt", doublePotion:"Doppeltrank", feverTime:"Fieberzeit", mail:"Post", missions:"Missionen", odds:"Chancen", ownedOvens:"Öfen", chips:"Schoko-Chips", buff:"Bonus", waiting:"Bereit", workshop:"Keks-Werkstatt", todayOvenSub:"Ofen des Tages ansehen", auto:"Auto", use:"Nutzen", active:"Aktiv" },
  ru: { click:"Нажатие", rebirth:"Перерождение", doublePotion:"Двойное зелье", feverTime:"Время лихорадки", mail:"Почта", missions:"Задания", odds:"Шансы", ownedOvens:"Печи", chips:"Шоко-чипы", buff:"Бафф", waiting:"Ожидание", workshop:"Кондитерская", todayOvenSub:"Посмотреть печь дня", auto:"Авто", use:"Использовать", active:"Активно" },
};

type ModalText = {
  settings: string; sound: string; music: string; musicMood: string; vibration: string;
  tapSound: string; language: string; calm: string; exciting: string; close: string;
  reset: string; resetDone: string; profile: string; bakeryGuide: string; next: string;
  complete: string; tapCookie: string; drawFirst: string; guideDone: string;
  mailbox: string; todayMissions: string; claimed: string; claim: string; reward: string;
  unavailable: string; rebirthNow: string; currentRebirth: string; equippedOven: string;
  none: string; offlineWaiting: string; autoBakery: string;
  tutorialSteps: string[]; resetPrompts: string[];
};

export const modalText: Record<GameLanguage, ModalText> = {
  ko: { settings:"설정",sound:"효과음",music:"배경 음악",musicMood:"음악 분위기",vibration:"진동",tapSound:"탭 효과음",language:"언어",calm:"차분함",exciting:"흥겨움",close:"닫기",reset:"데이터 초기화",resetDone:"삭제 완료",profile:"베이커 프로필",bakeryGuide:"베이커리 안내",next:"다음",complete:"완료",tapCookie:"쿠키를 눌러주세요",drawFirst:"뽑기를 진행해주세요",guideDone:"안내 완료 후",mailbox:"우편함",todayMissions:"오늘의 미션",claimed:"받음",claim:"받기",reward:"보상",unavailable:"오프라인 보상을 준비 중입니다",rebirthNow:"환생하기",currentRebirth:"현재 환생",equippedOven:"장착 오븐",none:"없음",offlineWaiting:"오프라인 보상을 준비 중입니다",autoBakery:"베이커리",tutorialSteps:["가운데 쿠키를 눌러 첫 쿠키를 구워보세요.","자동화 오븐을 15개까지 늘려보세요.","초코칩으로 첫 오븐 뽑기에 도전해 보세요.","우편함에서 안내 완료 보상을 확인해 보세요.","안내를 완료했습니다. 우편함에서 초코칩 10개를 받아가세요."],resetPrompts:["","데이터를 삭제하시겠습니까?","정말로요?","진짜 정말로 리셋하시겠습니까?","정말로 지금까지 한 것을 삭제하시겠습니까? 노력한 기록입니다.","정말 진짜로 삭제하시겠습니까? 해금한 도전과제와 노력이 사라지며 되돌릴 수 없습니다. 마지막 경고입니다."] },
  en: { settings:"Settings",sound:"Sound effects",music:"Background music",musicMood:"Music mood",vibration:"Vibration",tapSound:"Tap sound",language:"Language",calm:"Calm",exciting:"Exciting",close:"Close",reset:"Reset data",resetDone:"Reset complete",profile:"Baker profile",bakeryGuide:"Bakery guide",next:"Next",complete:"Complete",tapCookie:"Tap the cookie",drawFirst:"Make a draw first",guideDone:"After guide",mailbox:"Mailbox",todayMissions:"Daily missions",claimed:"Claimed",claim:"Claim",reward:"Reward",unavailable:"Preparing offline reward",rebirthNow:"Rebirth",currentRebirth:"Current rebirth",equippedOven:"Equipped oven",none:"None",offlineWaiting:"Preparing offline reward",autoBakery:"Bakery",tutorialSteps:["Tap the cookie in the center to bake your first cookie.","Grow your automation ovens to 15.","Spend a choco chip on your first oven draw.","Check the guide reward in your mailbox.","Guide complete. Claim 10 choco chips from your mailbox."],resetPrompts:["","Delete your save data?","Are you sure?","Really reset everything?","Delete all of your progress? This is your hard-earned record.","Final warning: unlocked achievements and progress cannot be restored."] },
  ja: { settings:"設定",sound:"効果音",music:"BGM",musicMood:"音楽の雰囲気",vibration:"バイブ",tapSound:"タップ音",language:"言語",calm:"落ち着き",exciting:"にぎやか",close:"閉じる",reset:"データを初期化",resetDone:"初期化完了",profile:"ベーカープロフィール",bakeryGuide:"ベーカリー案内",next:"次へ",complete:"完了",tapCookie:"クッキーをタップ",drawFirst:"ガチャを進めてください",guideDone:"案内完了後",mailbox:"メール",todayMissions:"今日のミッション",claimed:"受取済み",claim:"受取",reward:"報酬",unavailable:"オフライン報酬を準備中",rebirthNow:"転生する",currentRebirth:"現在の転生",equippedOven:"装備オーブン",none:"なし",offlineWaiting:"オフライン報酬を準備中",autoBakery:"ベーカリー",tutorialSteps:["中央のクッキーをタップして最初のクッキーを焼きましょう。","自動化オーブンを15台まで増やしましょう。","チョコチップで最初のオーブンガチャに挑戦しましょう。","メールで案内完了報酬を確認しましょう。","案内完了。メールからチョコチップ10個を受け取りましょう。"],resetPrompts:["","セーブデータを削除しますか？","本当によろしいですか？","すべてリセットしますか？","努力してきた記録を削除しますか？","最終確認です。実績と進行は元に戻せません。"] },
  zh: { settings:"设置",sound:"音效",music:"背景音乐",musicMood:"音乐氛围",vibration:"震动",tapSound:"点击音效",language:"语言",calm:"舒缓",exciting:"欢快",close:"关闭",reset:"重置数据",resetDone:"重置完成",profile:"烘焙师资料",bakeryGuide:"烘焙坊指南",next:"下一步",complete:"完成",tapCookie:"请点击曲奇",drawFirst:"请先抽取",guideDone:"完成指南后",mailbox:"邮箱",todayMissions:"每日任务",claimed:"已领取",claim:"领取",reward:"奖励",unavailable:"正在准备离线奖励",rebirthNow:"转生",currentRebirth:"当前转生",equippedOven:"装备烤炉",none:"无",offlineWaiting:"正在准备离线奖励",autoBakery:"烘焙坊",tutorialSteps:["点击中央的曲奇，烤出第一块曲奇。","将自动化烤炉提升至 15 台。","用巧克力筹码进行第一次烤炉抽取。","在邮箱中查看指南完成奖励。","指南完成。请从邮箱领取 10 个巧克力筹码。"],resetPrompts:["","要删除保存数据吗？","确定吗？","真的要重置一切吗？","要删除努力积累的记录吗？","最后警告：成就和进度无法恢复。"] },
  ar: { settings:"الإعدادات",sound:"المؤثرات",music:"موسيقى الخلفية",musicMood:"طابع الموسيقى",vibration:"اهتزاز",tapSound:"صوت النقر",language:"اللغة",calm:"هادئ",exciting:"متحمس",close:"إغلاق",reset:"إعادة البيانات",resetDone:"اكتملت الإعادة",profile:"ملف الخباز",bakeryGuide:"دليل المخبز",next:"التالي",complete:"إكمال",tapCookie:"المس الكعكة",drawFirst:"أجر السحب أولا",guideDone:"بعد إكمال الدليل",mailbox:"البريد",todayMissions:"مهام اليوم",claimed:"تم الاستلام",claim:"استلام",reward:"مكافأة",unavailable:"يتم تجهيز مكافأة عدم الاتصال",rebirthNow:"ولادة جديدة",currentRebirth:"الولادة الحالية",equippedOven:"الفرن المجهز",none:"لا شيء",offlineWaiting:"يتم تجهيز مكافأة عدم الاتصال",autoBakery:"المخبز",tutorialSteps:["المس الكعكة في الوسط لخبز أول كعكة.","ارفع عدد أفران الأتمتة إلى 15.","استخدم رقائق الشوكولاتة في أول سحب للفرن.","تحقق من مكافأة الدليل في البريد.","اكتمل الدليل. استلم 10 رقائق شوكولاتة من البريد."],resetPrompts:["","هل تريد حذف بيانات الحفظ؟","هل أنت متأكد؟","هل تريد إعادة كل شيء فعلا؟","هل تريد حذف سجل تقدمك؟","تحذير أخير: لا يمكن استعادة الإنجازات والتقدم."] },
  de: { settings:"Einstellungen",sound:"Soundeffekte",music:"Hintergrundmusik",musicMood:"Musikstil",vibration:"Vibration",tapSound:"Tippgeräusch",language:"Sprache",calm:"Ruhig",exciting:"Lebhaft",close:"Schließen",reset:"Daten zurücksetzen",resetDone:"Reset abgeschlossen",profile:"Bäckerprofil",bakeryGuide:"Bäckerei-Anleitung",next:"Weiter",complete:"Fertig",tapCookie:"Keks antippen",drawFirst:"Ziehung durchführen",guideDone:"Nach der Anleitung",mailbox:"Postfach",todayMissions:"Tagesmissionen",claimed:"Abgeholt",claim:"Abholen",reward:"Belohnung",unavailable:"Offline-Belohnung wird vorbereitet",rebirthNow:"Wiedergeburt",currentRebirth:"Aktuelle Wiedergeburt",equippedOven:"Ausgerüsteter Ofen",none:"Keine",offlineWaiting:"Offline-Belohnung wird vorbereitet",autoBakery:"Bäckerei",tutorialSteps:["Tippe den Keks in der Mitte an und backe deinen ersten Keks.","Erweitere deine Automatiköfen auf 15.","Nutze einen Schoko-Chip für deine erste Ofen-Ziehung.","Sieh im Postfach nach der Anleitung-Belohnung.","Anleitung abgeschlossen. Hole 10 Schoko-Chips im Postfach ab."],resetPrompts:["","Spielstand löschen?","Bist du sicher?","Wirklich alles zurücksetzen?","Möchtest du deinen Fortschritt löschen?","Letzte Warnung: Erfolge und Fortschritt können nicht wiederhergestellt werden."] },
  ru: { settings:"Настройки",sound:"Звуки",music:"Фоновая музыка",musicMood:"Настроение музыки",vibration:"Вибрация",tapSound:"Звук нажатия",language:"Язык",calm:"Спокойно",exciting:"Энергично",close:"Закрыть",reset:"Сбросить данные",resetDone:"Сброс завершен",profile:"Профиль пекаря",bakeryGuide:"Гид по пекарне",next:"Далее",complete:"Готово",tapCookie:"Нажмите на печенье",drawFirst:"Сделайте призыв",guideDone:"После гида",mailbox:"Почта",todayMissions:"Задания дня",claimed:"Получено",claim:"Получить",reward:"Награда",unavailable:"Готовим офлайн-награду",rebirthNow:"Переродиться",currentRebirth:"Текущее перерождение",equippedOven:"Выбранная печь",none:"Нет",offlineWaiting:"Готовим офлайн-награду",autoBakery:"Пекарня",tutorialSteps:["Нажмите на печенье в центре и испеките первое печенье.","Увеличьте число автоматических печей до 15.","Потратьте шоко-чип на первый призыв печи.","Проверьте награду за гид в почте.","Гид завершен. Заберите 10 шоко-чипов из почты."],resetPrompts:["","Удалить сохранение?","Вы уверены?","Правда сбросить всё?","Удалить весь накопленный прогресс?","Последнее предупреждение: достижения и прогресс нельзя восстановить."] },
};
