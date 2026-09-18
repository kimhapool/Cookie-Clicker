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
  drawLevel: string;
  nextBoost: string;
  none: string;
  chipDraw: string;
  premiumOvenDraw: string;
  collectionHint: string;
  boostHint: string;
  useDictionary: string;
  useDiary: string;
  traitDraw: string;
  currentTrait: string;
  traitHint: string;
  drawResult: string;
  basicOdds: string;
  premiumOdds: string;
};

export const pageText: Record<GameLanguage, PageText> = {
  ko: { drawTitle:"오븐 뽑기",basic:"기본",premium:"프리미엄",trait:"특성",drawOnce:"1회 뽑기",drawTen:"10회 뽑기",drawAll:"전부 뽑기",odds:"확률 보기",confirm:"확인",close:"닫기",buy:"구매",sell:"판매",equip:"장착",fuse:"융합",dismantle:"분해",ascending:"등급 오름차순",descending:"등급 내림차순",rebirth:"환생",active:"활성",idle:"대기",drawLevel:"뽑기 레벨",nextBoost:"다음 보정",none:"없음",chipDraw:"초코칩 뽑기",premiumOvenDraw:"프리미엄 오븐 뽑기",collectionHint:"오븐을 획득하고 컬렉션을 강화하세요",boostHint:"다음 뽑기에 준비된 확률 보정이 적용됩니다",useDictionary:"사전 사용",useDiary:"일기 사용",traitDraw:"특성 뽑기",currentTrait:"현재 특성",traitHint:"코어 결정으로 다음 특성을 획득합니다",drawResult:"회 뽑기 결과",basicOdds:"기본 확률",premiumOdds:"프리미엄 확률" },
  en: { drawTitle:"Oven Draw",basic:"Basic",premium:"Premium",trait:"Trait",drawOnce:"Draw 1",drawTen:"Draw 10",drawAll:"Draw All",odds:"View Odds",confirm:"Confirm",close:"Close",buy:"Buy",sell:"Sell",equip:"Equip",fuse:"Fuse",dismantle:"Dismantle",ascending:"Rarity: Low",descending:"Rarity: High",rebirth:"Rebirth",active:"Active",idle:"Idle",drawLevel:"Draw level",nextBoost:"Next bonus",none:"None",chipDraw:"Choco Chip Draw",premiumOvenDraw:"Premium Oven Draw",collectionHint:"Collect ovens and strengthen your collection.",boostHint:"Your prepared chance bonus applies to the next draw.",useDictionary:"Use Dictionary",useDiary:"Use Diary",traitDraw:"Trait Draw",currentTrait:"Current trait",traitHint:"Spend core crystals to earn the next trait.",drawResult:"draw result",basicOdds:"Basic odds",premiumOdds:"Premium odds" },
  ja: { drawTitle:"オーブンガチャ",basic:"基本",premium:"プレミアム",trait:"特性",drawOnce:"1回引く",drawTen:"10回引く",drawAll:"すべて引く",odds:"確率を見る",confirm:"確認",close:"閉じる",buy:"購入",sell:"売却",equip:"装備",fuse:"融合",dismantle:"分解",ascending:"レア度 昇順",descending:"レア度 降順",rebirth:"転生",active:"有効",idle:"待機",drawLevel:"ガチャレベル",nextBoost:"次の補正",none:"なし",chipDraw:"チョコチップガチャ",premiumOvenDraw:"プレミアムオーブンガチャ",collectionHint:"オーブンを獲得してコレクションを強化しましょう。",boostHint:"準備した確率補正は次のガチャに適用されます。",useDictionary:"辞典を使う",useDiary:"日記を使う",traitDraw:"特性ガチャ",currentTrait:"現在の特性",traitHint:"コア結晶で次の特性を獲得します。",drawResult:"回のガチャ結果",basicOdds:"基本確率",premiumOdds:"プレミアム確率" },
  zh: { drawTitle:"烤炉抽取",basic:"基础",premium:"高级",trait:"特性",drawOnce:"抽取 1 次",drawTen:"抽取 10 次",drawAll:"全部抽取",odds:"查看概率",confirm:"确认",close:"关闭",buy:"购买",sell:"出售",equip:"装备",fuse:"融合",dismantle:"分解",ascending:"稀有度升序",descending:"稀有度降序",rebirth:"转生",active:"生效中",idle:"待命",drawLevel:"抽取等级",nextBoost:"下次加成",none:"无",chipDraw:"巧克力筹码抽取",premiumOvenDraw:"高级烤炉抽取",collectionHint:"获得烤炉并强化收藏。",boostHint:"已准备的概率加成将用于下一次抽取。",useDictionary:"使用词典",useDiary:"使用日记",traitDraw:"特性抽取",currentTrait:"当前特性",traitHint:"使用核心结晶获得下一项特性。",drawResult:"次抽取结果",basicOdds:"基础概率",premiumOdds:"高级概率" },
  ar: { drawTitle:"سحب الفرن",basic:"أساسي",premium:"مميز",trait:"سمة",drawOnce:"سحب مرة",drawTen:"سحب 10",drawAll:"سحب الكل",odds:"عرض الاحتمالات",confirm:"تأكيد",close:"إغلاق",buy:"شراء",sell:"بيع",equip:"تجهيز",fuse:"دمج",dismantle:"تفكيك",ascending:"الندرة تصاعديا",descending:"الندرة تنازليا",rebirth:"ولادة جديدة",active:"نشط",idle:"انتظار",drawLevel:"مستوى السحب",nextBoost:"تعزيز السحب التالي",none:"لا شيء",chipDraw:"سحب رقائق الشوكولاتة",premiumOvenDraw:"سحب فرن مميز",collectionHint:"اجمع الأفران وعزز مجموعتك.",boostHint:"يطبق تعزيز الاحتمال المحضر على السحب التالي.",useDictionary:"استخدم القاموس",useDiary:"استخدم المذكرات",traitDraw:"سحب السمة",currentTrait:"السمة الحالية",traitHint:"استخدم بلورات النواة لكسب السمة التالية.",drawResult:"نتيجة السحب",basicOdds:"احتمالات أساسية",premiumOdds:"احتمالات مميزة" },
  de: { drawTitle:"Ofen-Ziehung",basic:"Basis",premium:"Premium",trait:"Merkmal",drawOnce:"1 Ziehung",drawTen:"10 Ziehungen",drawAll:"Alle ziehen",odds:"Chancen",confirm:"Bestätigen",close:"Schließen",buy:"Kaufen",sell:"Verkaufen",equip:"Ausrüsten",fuse:"Verschmelzen",dismantle:"Zerlegen",ascending:"Seltenheit auf",descending:"Seltenheit ab",rebirth:"Wiedergeburt",active:"Aktiv",idle:"Bereit",drawLevel:"Ziehungslevel",nextBoost:"Nächster Bonus",none:"Keine",chipDraw:"Schoko-Chip-Ziehung",premiumOvenDraw:"Premium-Ofen-Ziehung",collectionHint:"Sammle Öfen und stärke deine Sammlung.",boostHint:"Der vorbereitete Chancenbonus gilt für die nächste Ziehung.",useDictionary:"Wörterbuch nutzen",useDiary:"Tagebuch nutzen",traitDraw:"Merkmal-Ziehung",currentTrait:"Aktuelles Merkmal",traitHint:"Nutze Kernkristalle für das nächste Merkmal.",drawResult:"Ziehungsergebnis",basicOdds:"Basis-Chancen",premiumOdds:"Premium-Chancen" },
  ru: { drawTitle:"Призыв печи",basic:"Обычный",premium:"Премиум",trait:"Свойство",drawOnce:"Призвать 1",drawTen:"Призвать 10",drawAll:"Призвать всё",odds:"Шансы",confirm:"Подтвердить",close:"Закрыть",buy:"Купить",sell:"Продать",equip:"Надеть",fuse:"Слить",dismantle:"Разобрать",ascending:"Редкость по возр.",descending:"Редкость по убыв.",rebirth:"Перерождение",active:"Активно",idle:"Ожидание",drawLevel:"Уровень призыва",nextBoost:"Следующий бонус",none:"Нет",chipDraw:"Призыв за шоко-чипы",premiumOvenDraw:"Премиум-призыв печи",collectionHint:"Собирайте печи и усиливайте коллекцию.",boostHint:"Подготовленный бонус шанса действует на следующий призыв.",useDictionary:"Использовать словарь",useDiary:"Использовать дневник",traitDraw:"Призыв свойства",currentTrait:"Текущее свойство",traitHint:"Тратьте кристаллы ядра на следующее свойство.",drawResult:"результат призыва",basicOdds:"Обычные шансы",premiumOdds:"Премиум-шансы" },
};

type HomeText = {
  click: string; rebirth: string; doublePotion: string; feverTime: string;
  mail: string; missions: string; odds: string; ownedOvens: string;
  chips: string; buff: string; waiting: string; workshop: string;
  todayOvenSub: string; auto: string; use: string; active: string;
  ovenUnit: string; chipUnit: string; seconds: string; times: string;
  doubleCost: string; feverCost: string; perSecond: string;
  achievementUnlocked: string; firstBake: string; bakeryOpen: string; newLife: string; ovenCollector: string;
};
export const homeText: Record<GameLanguage, HomeText> = {
  ko: { click:"클릭", rebirth:"환생", doublePotion:"더블 포션", feverTime:"피버 타임", mail:"우편", missions:"미션", odds:"확률", ownedOvens:"보유 오븐", chips:"초코칩", buff:"버프", waiting:"대기", workshop:"쿠키 작업대", todayOvenSub:"오늘의 오븐을 확인하세요", auto:"자동", use:"사용", active:"진행 중",ovenUnit:"종",chipUnit:"개",seconds:"초",times:"배",doubleCost:"2배 · 5,000 쿠키",feverCost:"4배 · 25,000 쿠키",perSecond:"/초",achievementUnlocked:"도전과제 달성",firstBake:"첫 반죽",bakeryOpen:"빵집 개업",newLife:"새로운 생",ovenCollector:"오븐 수집가" },
  en: { click:"Tap", rebirth:"Rebirth", doublePotion:"Double Potion", feverTime:"Fever Time", mail:"Mail", missions:"Missions", odds:"Odds", ownedOvens:"Ovens", chips:"Choco Chips", buff:"Buff", waiting:"Idle", workshop:"Cookie Workshop", todayOvenSub:"See today's oven", auto:"Auto", use:"Use", active:"Active",ovenUnit:" ovens",chipUnit:" chips",seconds:"s",times:"x",doubleCost:"2× · 5,000 cookies",feverCost:"4× · 25,000 cookies",perSecond:"/s",achievementUnlocked:"Achievement unlocked",firstBake:"First Batch",bakeryOpen:"Bakery Opening",newLife:"New Life",ovenCollector:"Oven Collector" },
  ja: { click:"タップ", rebirth:"転生", doublePotion:"ダブルポーション", feverTime:"フィーバータイム", mail:"メール", missions:"ミッション", odds:"確率", ownedOvens:"所持オーブン", chips:"チョコチップ", buff:"バフ", waiting:"待機", workshop:"クッキー作業台", todayOvenSub:"今日のオーブンを確認", auto:"自動", use:"使用", active:"発動中",ovenUnit:"種",chipUnit:"個",seconds:"秒",times:"倍",doubleCost:"2倍 · クッキー 5,000",feverCost:"4倍 · クッキー 25,000",perSecond:"/秒",achievementUnlocked:"実績達成",firstBake:"最初の生地",bakeryOpen:"ベーカリー開店",newLife:"新しい命",ovenCollector:"オーブン収集家" },
  zh: { click:"点击", rebirth:"转生", doublePotion:"双倍药水", feverTime:"狂热时间", mail:"邮件", missions:"任务", odds:"概率", ownedOvens:"拥有烤炉", chips:"巧克力筹码", buff:"增益", waiting:"待命", workshop:"曲奇工坊", todayOvenSub:"查看今日烤炉", auto:"自动", use:"使用", active:"进行中",ovenUnit:"种",chipUnit:"个",seconds:"秒",times:"倍",doubleCost:"2倍 · 5,000 曲奇",feverCost:"4倍 · 25,000 曲奇",perSecond:"/秒",achievementUnlocked:"成就解锁",firstBake:"第一份面团",bakeryOpen:"烘焙坊开业",newLife:"新生",ovenCollector:"烤炉收藏家" },
  ar: { click:"نقر", rebirth:"ولادة جديدة", doublePotion:"جرعة مضاعفة", feverTime:"وقت الحمى", mail:"البريد", missions:"المهام", odds:"الاحتمالات", ownedOvens:"الأفران", chips:"رقائق الشوكولاتة", buff:"تعزيز", waiting:"انتظار", workshop:"ورشة الكعك", todayOvenSub:"تحقق من فرن اليوم", auto:"تلقائي", use:"استخدم", active:"نشط",ovenUnit:" أفران",chipUnit:" رقائق",seconds:"ث",times:"×",doubleCost:"2× · 5,000 كعكة",feverCost:"4× · 25,000 كعكة",perSecond:"/ث",achievementUnlocked:"تم فتح إنجاز",firstBake:"أول عجينة",bakeryOpen:"افتتاح المخبز",newLife:"حياة جديدة",ovenCollector:"جامع الأفران" },
  de: { click:"Klick", rebirth:"Wiedergeburt", doublePotion:"Doppeltrank", feverTime:"Fieberzeit", mail:"Post", missions:"Missionen", odds:"Chancen", ownedOvens:"Öfen", chips:"Schoko-Chips", buff:"Bonus", waiting:"Bereit", workshop:"Keks-Werkstatt", todayOvenSub:"Ofen des Tages ansehen", auto:"Auto", use:"Nutzen", active:"Aktiv",ovenUnit:" Öfen",chipUnit:" Chips",seconds:"s",times:"×",doubleCost:"2× · 5.000 Kekse",feverCost:"4× · 25.000 Kekse",perSecond:"/s",achievementUnlocked:"Erfolg freigeschaltet",firstBake:"Erster Teig",bakeryOpen:"Bäckerei-Eröffnung",newLife:"Neues Leben",ovenCollector:"Ofensammler" },
  ru: { click:"Нажатие", rebirth:"Перерождение", doublePotion:"Двойное зелье", feverTime:"Время лихорадки", mail:"Почта", missions:"Задания", odds:"Шансы", ownedOvens:"Печи", chips:"Шоко-чипы", buff:"Бафф", waiting:"Ожидание", workshop:"Кондитерская", todayOvenSub:"Посмотреть печь дня", auto:"Авто", use:"Использовать", active:"Активно",ovenUnit:" печей",chipUnit:" чипов",seconds:"с",times:"×",doubleCost:"2× · 5 000 печений",feverCost:"4× · 25 000 печений",perSecond:"/с",achievementUnlocked:"Достижение открыто",firstBake:"Первое тесто",bakeryOpen:"Открытие пекарни",newLife:"Новая жизнь",ovenCollector:"Коллекционер печей" },
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
  tapPop: string; tapDrum: string; tapBite: string; tapCrumble: string;
};

export const modalText: Record<GameLanguage, ModalText> = {
  ko: { settings:"설정",sound:"효과음",music:"배경 음악",musicMood:"음악 분위기",vibration:"진동",tapSound:"탭 효과음",language:"언어",calm:"차분함",exciting:"흥겨움",close:"닫기",reset:"데이터 초기화",resetDone:"삭제 완료",profile:"베이커 프로필",bakeryGuide:"베이커리 안내",next:"다음",complete:"완료",tapCookie:"쿠키를 눌러주세요",drawFirst:"뽑기를 진행해주세요",guideDone:"안내 완료 후",mailbox:"우편함",todayMissions:"오늘의 미션",claimed:"받음",claim:"받기",reward:"보상",unavailable:"오프라인 보상을 준비 중입니다",rebirthNow:"환생하기",currentRebirth:"현재 환생",equippedOven:"장착 오븐",none:"없음",offlineWaiting:"오프라인 보상을 준비 중입니다",autoBakery:"베이커리",tutorialSteps:["가운데 쿠키를 눌러 첫 쿠키를 구워보세요.","자동화 오븐을 15개까지 늘려보세요.","초코칩으로 첫 오븐 뽑기에 도전해 보세요.","우편함에서 안내 완료 보상을 확인해 보세요.","안내를 완료했습니다. 우편함에서 초코칩 10개를 받아가세요."],resetPrompts:["","데이터를 삭제하시겠습니까?","정말로요?","진짜 정말로 리셋하시겠습니까?","정말로 지금까지 한 것을 삭제하시겠습니까? 노력한 기록입니다.","정말 진짜로 삭제하시겠습니까? 해금한 도전과제와 노력이 사라지며 되돌릴 수 없습니다. 마지막 경고입니다."],tapPop:"팝",tapDrum:"드럼",tapBite:"바삭한 한입",tapCrumble:"부스러짐" },
  en: { settings:"Settings",sound:"Sound effects",music:"Background music",musicMood:"Music mood",vibration:"Vibration",tapSound:"Tap sound",language:"Language",calm:"Calm",exciting:"Exciting",close:"Close",reset:"Reset data",resetDone:"Reset complete",profile:"Baker profile",bakeryGuide:"Bakery guide",next:"Next",complete:"Complete",tapCookie:"Tap the cookie",drawFirst:"Make a draw first",guideDone:"After guide",mailbox:"Mailbox",todayMissions:"Daily missions",claimed:"Claimed",claim:"Claim",reward:"Reward",unavailable:"Preparing offline reward",rebirthNow:"Rebirth",currentRebirth:"Current rebirth",equippedOven:"Equipped oven",none:"None",offlineWaiting:"Preparing offline reward",autoBakery:"Bakery",tutorialSteps:["Tap the cookie in the center to bake your first cookie.","Grow your automation ovens to 15.","Spend a choco chip on your first oven draw.","Check the guide reward in your mailbox.","Guide complete. Claim 10 choco chips from your mailbox."],resetPrompts:["","Delete your save data?","Are you sure?","Really reset everything?","Delete all of your progress? This is your hard-earned record.","Final warning: unlocked achievements and progress cannot be restored."],tapPop:"Pop",tapDrum:"Drum",tapBite:"Crisp bite",tapCrumble:"Crumble" },
  ja: { settings:"設定",sound:"効果音",music:"BGM",musicMood:"音楽の雰囲気",vibration:"バイブ",tapSound:"タップ音",language:"言語",calm:"落ち着き",exciting:"にぎやか",close:"閉じる",reset:"データを初期化",resetDone:"初期化完了",profile:"ベーカープロフィール",bakeryGuide:"ベーカリー案内",next:"次へ",complete:"完了",tapCookie:"クッキーをタップ",drawFirst:"ガチャを進めてください",guideDone:"案内完了後",mailbox:"メール",todayMissions:"今日のミッション",claimed:"受取済み",claim:"受取",reward:"報酬",unavailable:"オフライン報酬を準備中",rebirthNow:"転生する",currentRebirth:"現在の転生",equippedOven:"装備オーブン",none:"なし",offlineWaiting:"オフライン報酬を準備中",autoBakery:"ベーカリー",tutorialSteps:["中央のクッキーをタップして最初のクッキーを焼きましょう。","自動化オーブンを15台まで増やしましょう。","チョコチップで最初のオーブンガチャに挑戦しましょう。","メールで案内完了報酬を確認しましょう。","案内完了。メールからチョコチップ10個を受け取りましょう。"],resetPrompts:["","セーブデータを削除しますか？","本当によろしいですか？","すべてリセットしますか？","努力してきた記録を削除しますか？","最終確認です。実績と進行は元に戻せません。"],tapPop:"ポップ",tapDrum:"ドラム",tapBite:"サクサク一口",tapCrumble:"くずれる音" },
  zh: { settings:"设置",sound:"音效",music:"背景音乐",musicMood:"音乐氛围",vibration:"震动",tapSound:"点击音效",language:"语言",calm:"舒缓",exciting:"欢快",close:"关闭",reset:"重置数据",resetDone:"重置完成",profile:"烘焙师资料",bakeryGuide:"烘焙坊指南",next:"下一步",complete:"完成",tapCookie:"请点击曲奇",drawFirst:"请先抽取",guideDone:"完成指南后",mailbox:"邮箱",todayMissions:"每日任务",claimed:"已领取",claim:"领取",reward:"奖励",unavailable:"正在准备离线奖励",rebirthNow:"转生",currentRebirth:"当前转生",equippedOven:"装备烤炉",none:"无",offlineWaiting:"正在准备离线奖励",autoBakery:"烘焙坊",tutorialSteps:["点击中央的曲奇，烤出第一块曲奇。","将自动化烤炉提升至 15 台。","用巧克力筹码进行第一次烤炉抽取。","在邮箱中查看指南完成奖励。","指南完成。请从邮箱领取 10 个巧克力筹码。"],resetPrompts:["","要删除保存数据吗？","确定吗？","真的要重置一切吗？","要删除努力积累的记录吗？","最后警告：成就和进度无法恢复。"],tapPop:"弹跳",tapDrum:"鼓点",tapBite:"酥脆咬一口",tapCrumble:"碎裂" },
  ar: { settings:"الإعدادات",sound:"المؤثرات",music:"موسيقى الخلفية",musicMood:"طابع الموسيقى",vibration:"اهتزاز",tapSound:"صوت النقر",language:"اللغة",calm:"هادئ",exciting:"متحمس",close:"إغلاق",reset:"إعادة البيانات",resetDone:"اكتملت الإعادة",profile:"ملف الخباز",bakeryGuide:"دليل المخبز",next:"التالي",complete:"إكمال",tapCookie:"المس الكعكة",drawFirst:"أجر السحب أولا",guideDone:"بعد إكمال الدليل",mailbox:"البريد",todayMissions:"مهام اليوم",claimed:"تم الاستلام",claim:"استلام",reward:"مكافأة",unavailable:"يتم تجهيز مكافأة عدم الاتصال",rebirthNow:"ولادة جديدة",currentRebirth:"الولادة الحالية",equippedOven:"الفرن المجهز",none:"لا شيء",offlineWaiting:"يتم تجهيز مكافأة عدم الاتصال",autoBakery:"المخبز",tutorialSteps:["المس الكعكة في الوسط لخبز أول كعكة.","ارفع عدد أفران الأتمتة إلى 15.","استخدم رقائق الشوكولاتة في أول سحب للفرن.","تحقق من مكافأة الدليل في البريد.","اكتمل الدليل. استلم 10 رقائق شوكولاتة من البريد."],resetPrompts:["","هل تريد حذف بيانات الحفظ؟","هل أنت متأكد؟","هل تريد إعادة كل شيء فعلا؟","هل تريد حذف سجل تقدمك؟","تحذير أخير: لا يمكن استعادة الإنجازات والتقدم."],tapPop:"فرقعة",tapDrum:"طبلة",tapBite:"قضمة مقرمشة",tapCrumble:"تفتت" },
  de: { settings:"Einstellungen",sound:"Soundeffekte",music:"Hintergrundmusik",musicMood:"Musikstil",vibration:"Vibration",tapSound:"Tippgeräusch",language:"Sprache",calm:"Ruhig",exciting:"Lebhaft",close:"Schließen",reset:"Daten zurücksetzen",resetDone:"Reset abgeschlossen",profile:"Bäckerprofil",bakeryGuide:"Bäckerei-Anleitung",next:"Weiter",complete:"Fertig",tapCookie:"Keks antippen",drawFirst:"Ziehung durchführen",guideDone:"Nach der Anleitung",mailbox:"Postfach",todayMissions:"Tagesmissionen",claimed:"Abgeholt",claim:"Abholen",reward:"Belohnung",unavailable:"Offline-Belohnung wird vorbereitet",rebirthNow:"Wiedergeburt",currentRebirth:"Aktuelle Wiedergeburt",equippedOven:"Ausgerüsteter Ofen",none:"Keine",offlineWaiting:"Offline-Belohnung wird vorbereitet",autoBakery:"Bäckerei",tutorialSteps:["Tippe den Keks in der Mitte an und backe deinen ersten Keks.","Erweitere deine Automatiköfen auf 15.","Nutze einen Schoko-Chip für deine erste Ofen-Ziehung.","Sieh im Postfach nach der Anleitung-Belohnung.","Anleitung abgeschlossen. Hole 10 Schoko-Chips im Postfach ab."],resetPrompts:["","Spielstand löschen?","Bist du sicher?","Wirklich alles zurücksetzen?","Möchtest du deinen Fortschritt löschen?","Letzte Warnung: Erfolge und Fortschritt können nicht wiederhergestellt werden."],tapPop:"Pop",tapDrum:"Trommel",tapBite:"Knuspriger Biss",tapCrumble:"Krümeln" },
  ru: { settings:"Настройки",sound:"Звуки",music:"Фоновая музыка",musicMood:"Настроение музыки",vibration:"Вибрация",tapSound:"Звук нажатия",language:"Язык",calm:"Спокойно",exciting:"Энергично",close:"Закрыть",reset:"Сбросить данные",resetDone:"Сброс завершен",profile:"Профиль пекаря",bakeryGuide:"Гид по пекарне",next:"Далее",complete:"Готово",tapCookie:"Нажмите на печенье",drawFirst:"Сделайте призыв",guideDone:"После гида",mailbox:"Почта",todayMissions:"Задания дня",claimed:"Получено",claim:"Получить",reward:"Награда",unavailable:"Готовим офлайн-награду",rebirthNow:"Переродиться",currentRebirth:"Текущее перерождение",equippedOven:"Выбранная печь",none:"Нет",offlineWaiting:"Готовим офлайн-награду",autoBakery:"Пекарня",tutorialSteps:["Нажмите на печенье в центре и испеките первое печенье.","Увеличьте число автоматических печей до 15.","Потратьте шоко-чип на первый призыв печи.","Проверьте награду за гид в почте.","Гид завершен. Заберите 10 шоко-чипов из почты."],resetPrompts:["","Удалить сохранение?","Вы уверены?","Правда сбросить всё?","Удалить весь накопленный прогресс?","Последнее предупреждение: достижения и прогресс нельзя восстановить."],tapPop:"Поп",tapDrum:"Барабан",tapBite:"Хрустящий укус",tapCrumble:"Крошки" },
};

type InventoryText = {
  dictionary: string; diary: string; aurora: string; opternal: string; twilight: string;
  phoenix: string; infinity: string; collection: string; equipped: string; owned: string;
  fusion: string; trait: string;
};

export const inventoryText: Record<GameLanguage, InventoryText> = {
  ko: { dictionary:"미래를 담은 사전",diary:"시간 여행자의 일기",aurora:"오로라",opternal:"옵터널",twilight:"황혼",phoenix:"피닉스",infinity:"인피니티",collection:"오븐 컬렉션",equipped:"장착됨",owned:"보유",fusion:"융합",trait:"특성" },
  en: { dictionary:"Future-Bound Dictionary",diary:"Time Traveler's Diary",aurora:"Aurora",opternal:"Opternal",twilight:"Twilight",phoenix:"Phoenix",infinity:"Infinity",collection:"Oven Collection",equipped:"Equipped",owned:"Owned",fusion:"Fusion",trait:"Trait" },
  ja: { dictionary:"未来を秘めた辞典",diary:"時空旅行者の日記",aurora:"オーロラ",opternal:"オプターナル",twilight:"トワイライト",phoenix:"フェニックス",infinity:"インフィニティ",collection:"オーブンコレクション",equipped:"装備中",owned:"所持",fusion:"融合",trait:"特性" },
  zh: { dictionary:"承载未来的词典",diary:"时空旅行者日记",aurora:"极光",opternal:"永恒",twilight:"暮光",phoenix:"凤凰",infinity:"无限",collection:"烤炉收藏",equipped:"已装备",owned:"拥有",fusion:"融合",trait:"特性" },
  ar: { dictionary:"قاموس المستقبل",diary:"مذكرات مسافر الزمن",aurora:"أورورا",opternal:"أوبترنال",twilight:"الشفق",phoenix:"فينيكس",infinity:"اللانهاية",collection:"مجموعة الأفران",equipped:"مجهز",owned:"مملوك",fusion:"دمج",trait:"سمة" },
  de: { dictionary:"Zukunftsgebundenes Wörterbuch",diary:"Tagebuch des Zeitreisenden",aurora:"Aurora",opternal:"Opternal",twilight:"Dämmerung",phoenix:"Phönix",infinity:"Unendlichkeit",collection:"Ofensammlung",equipped:"Ausgerüstet",owned:"Besitz",fusion:"Verschmelzung",trait:"Merkmal" },
  ru: { dictionary:"Словарь будущего",diary:"Дневник путешественника во времени",aurora:"Аврора",opternal:"Оптернал",twilight:"Сумерки",phoenix:"Феникс",infinity:"Бесконечность",collection:"Коллекция печей",equipped:"Экипировано",owned:"Есть",fusion:"Слияние",trait:"Свойство" },
};

const englishOvenNames = [
  "Clay Starter Oven", "Brick Hearth", "Tin Sheet Oven", "Sugar Kiln",
  "Copper Rotary Oven", "Steam Rack Oven", "Caramel Pressure Oven", "Moonstone Oven",
  "Aurora Core Oven", "Dragon Furnace", "Phoenix Crucible", "Chrono Bloom Oven",
  "Eternal Prism", "Eternal Archive", "Starforge Oven", "Void Relic",
  "The Eternal Absolute Infinite Maxkiter Oven",
];

export function ovenDisplayName(id: string, fallback: string, language: GameLanguage) {
  if (language === "en") return englishOvenNames[Number(id.replace("oven-", ""))] ?? fallback;
  return fallback;
}

export const traitNames: Record<GameLanguage, Record<string, string>> = {
  ko: { "없음": "없음", "샤이니": "샤이니", "반전": "반전", "글리치": "글리치" },
  en: { "없음": "None", "샤이니": "Shiny", "반전": "Reversal", "글리치": "Glitch" },
  ja: { "없음": "なし", "샤이니": "シャイニー", "반전": "反転", "글리치": "グリッチ" },
  zh: { "없음": "无", "샤이니": "闪耀", "반전": "反转", "글리치": "故障" },
  ar: { "없음": "لا شيء", "샤이니": "لامع", "반전": "عكس", "글리치": "خلل" },
  de: { "없음": "Keine", "샤이니": "Glänzend", "반전": "Umkehr", "글리치": "Glitch" },
  ru: { "없음": "Нет", "샤이니": "Сияние", "반전": "Инверсия", "글리치": "Глитч" },
};

type ProgressText = {
  exchangeInfo: string; cookiesOwned: string; exchangeOne: string; exchangeTen: string; exchangeAll: string;
  premiumExchange: string; premiumCost: string; dictionaryCost: string; dictionaryExchange: string;
  diaryCost: string; diaryCraft: string; rebirthInfo: string; rebirthCost: string; sweetBoost: string;
  boostInfo: string; permanent: string; upgradeCost: string; production: string; productionInfo: string;
  achievements: [string, string][]; secretAchievements: [string, string][];
};
export const progressText: Record<GameLanguage, ProgressText> = {
  ko: { exchangeInfo:"100,000 쿠키를 초코칩 1개로 교환합니다.",cookiesOwned:"보유 쿠키",exchangeOne:"1개 교환",exchangeTen:"10개 교환",exchangeAll:"전부 교환",premiumExchange:"🍫 고급 교환",premiumCost:"초코칩 10,000개 → 프리미엄 초코칩 1개",dictionaryCost:"초코칩 1,000,000개 → 미래를 담은 사전 1권",dictionaryExchange:"미래를 담은 사전 교환",diaryCost:"사전 3권 → 시간 여행자의 일기 1권",diaryCraft:"시간 여행자의 일기 제작",rebirthInfo:"환생할 때마다 클릭과 자동화 생산량이 50% 증가합니다.",rebirthCost:"현재 {count}회 · 필요 쿠키 {cost}",sweetBoost:"🍪 달콤한 부스트",boostInfo:"부스트는 홈 화면에서 사용하실 수 있습니다.",permanent:"영구 강화",upgradeCost:"{cost} 쿠키로 강화",production:"🏭 생산 강화",productionInfo:"자동화 오븐을 늘려 초당 생산량을 올리세요.",achievements:[["첫 반죽","쿠키를 처음 구웠습니다"],["빵집 개업","가정용 오븐을 구매했습니다"],["오븐 수집가","오븐 5종을 보유했습니다"],["달콤한 전환","초코칩 10개를 모았습니다"],["새로운 생","첫 환생을 완료했습니다"],["새 출발","데이터 초기화 후 다시 베이커리를 열었습니다"]],secretAchievements:[["달빛 제빵사","숨겨진 뽑기 기록을 달성했습니다"],["무한의 향","Secret 오븐을 다시 만났습니다"]] },
  en: { exchangeInfo:"Exchange 100,000 cookies for 1 choco chip.",cookiesOwned:"Cookies owned",exchangeOne:"Exchange 1",exchangeTen:"Exchange 10",exchangeAll:"Exchange all",premiumExchange:"🍫 Premium exchange",premiumCost:"10,000 choco chips → 1 premium chip",dictionaryCost:"1,000,000 choco chips → 1 Future-Bound Dictionary",dictionaryExchange:"Exchange Dictionary",diaryCost:"3 dictionaries → 1 Time Traveler's Diary",diaryCraft:"Craft Diary",rebirthInfo:"Each rebirth increases tap and automation production by 50%.",rebirthCost:"Rebirth {count} · Need {cost} cookies",sweetBoost:"🍪 Sweet boost",boostInfo:"Use boosts from the Home screen.",permanent:"Permanent upgrades",upgradeCost:"Upgrade for {cost} cookies",production:"🏭 Production upgrade",productionInfo:"Add automation ovens to raise production per second.",achievements:[["First Batch","Baked your first cookie."],["Bakery Opening","Bought a home oven."],["Oven Collector","Own 5 oven types."],["Sweet Exchange","Collected 10 choco chips."],["New Life","Completed your first rebirth."],["Fresh Start","Opened the bakery again after resetting data."]],secretAchievements:[["Moonlit Baker","Reached the hidden draw record."],["Scent of Infinity","Met the Secret oven again."]] },
  ja: { exchangeInfo:"クッキー100,000枚をチョコチップ1個に交換します。",cookiesOwned:"所持クッキー",exchangeOne:"1個交換",exchangeTen:"10個交換",exchangeAll:"すべて交換",premiumExchange:"🍫 上級交換",premiumCost:"チョコチップ10,000個 → プレミアムチップ1個",dictionaryCost:"チョコチップ1,000,000個 → 未来を秘めた辞典1冊",dictionaryExchange:"辞典と交換",diaryCost:"辞典3冊 → 時空旅行者の日記1冊",diaryCraft:"日記を作成",rebirthInfo:"転生ごとにタップと自動化生産が50%上がります。",rebirthCost:"転生 {count}回 · 必要クッキー {cost}",sweetBoost:"🍪 スイートブースト",boostInfo:"ブーストはホーム画面で使えます。",permanent:"恒久強化",upgradeCost:"{cost} クッキーで強化",production:"🏭 生産強化",productionInfo:"自動化オーブンを増やして毎秒生産を上げましょう。",achievements:[["最初の生地","初めてクッキーを焼きました。"],["ベーカリー開店","家庭用オーブンを購入しました。"],["オーブン収集家","オーブン5種を所持しました。"],["甘い交換","チョコチップ10個を集めました。"],["新しい命","初めて転生しました。"],["新たな出発","データ初期化後に再びベーカリーを開きました。"]],secretAchievements:[["月明かりのパン職人","隠しガチャ記録を達成しました。"],["無限の香り","Secretオーブンに再会しました。"]] },
  zh: { exchangeInfo:"用 100,000 曲奇兑换 1 个巧克力筹码。",cookiesOwned:"持有曲奇",exchangeOne:"兑换 1 个",exchangeTen:"兑换 10 个",exchangeAll:"全部兑换",premiumExchange:"🍫 高级兑换",premiumCost:"10,000 巧克力筹码 → 1 高级筹码",dictionaryCost:"1,000,000 巧克力筹码 → 1 本未来词典",dictionaryExchange:"兑换词典",diaryCost:"3 本词典 → 1 本时空旅行者日记",diaryCraft:"制作日记",rebirthInfo:"每次转生使点击和自动化生产提高 50%。",rebirthCost:"转生 {count} 次 · 需要 {cost} 曲奇",sweetBoost:"🍪 甜蜜增益",boostInfo:"请在主页使用增益。",permanent:"永久强化",upgradeCost:"用 {cost} 曲奇强化",production:"🏭 生产强化",productionInfo:"增加自动化烤炉以提高每秒产量。",achievements:[["第一份面团","首次烘焙曲奇。"],["烘焙坊开业","购买了家用烤炉。"],["烤炉收藏家","拥有 5 种烤炉。"],["甜蜜兑换","收集了 10 个巧克力筹码。"],["新生","完成首次转生。"],["重新开始","重置数据后再次开设烘焙坊。"]],secretAchievements:[["月光烘焙师","达成隐藏抽取记录。"],["无限之香","再次遇见 Secret 烤炉。"]] },
  ar: { exchangeInfo:"استبدل 100,000 كعكة برقاقة شوكولاتة واحدة.",cookiesOwned:"الكعكات المملوكة",exchangeOne:"استبدل 1",exchangeTen:"استبدل 10",exchangeAll:"استبدل الكل",premiumExchange:"🍫 تبادل مميز",premiumCost:"10,000 رقاقة → رقاقة مميزة واحدة",dictionaryCost:"1,000,000 رقاقة → قاموس مستقبل واحد",dictionaryExchange:"تبادل القاموس",diaryCost:"3 قواميس → مذكرات زمنية واحدة",diaryCraft:"صنع المذكرات",rebirthInfo:"كل ولادة جديدة ترفع النقر والإنتاج التلقائي 50٪.",rebirthCost:"ولادة {count} · تحتاج {cost} كعكة",sweetBoost:"🍪 تعزيز حلو",boostInfo:"استخدم التعزيزات من الشاشة الرئيسية.",permanent:"ترقيات دائمة",upgradeCost:"ترقية مقابل {cost} كعكة",production:"🏭 ترقية الإنتاج",productionInfo:"أضف أفراناً تلقائية لرفع الإنتاج بالثانية.",achievements:[["أول عجينة","خبزت أول كعكة."],["افتتاح المخبز","اشتريت فرناً منزلياً."],["جامع الأفران","تملك 5 أنواع أفران."],["تبادل حلو","جمعت 10 رقائق."],["حياة جديدة","أكملت أول ولادة جديدة."],["بداية جديدة","فتحت المخبز بعد إعادة البيانات."]],secretAchievements:[["خباز القمر","حققت سجل السحب المخفي."],["عطر اللانهاية","قابلت فرن Secret مجدداً."]] },
  de: { exchangeInfo:"Tausche 100.000 Kekse gegen 1 Schoko-Chip.",cookiesOwned:"Kekse im Besitz",exchangeOne:"1 tauschen",exchangeTen:"10 tauschen",exchangeAll:"Alles tauschen",premiumExchange:"🍫 Premium-Tausch",premiumCost:"10.000 Schoko-Chips → 1 Premium-Chip",dictionaryCost:"1.000.000 Schoko-Chips → 1 Zukunftswörterbuch",dictionaryExchange:"Wörterbuch tauschen",diaryCost:"3 Wörterbücher → 1 Zeitreisenden-Tagebuch",diaryCraft:"Tagebuch herstellen",rebirthInfo:"Jede Wiedergeburt erhöht Tipp- und Automatikproduktion um 50 %.",rebirthCost:"Wiedergeburt {count} · Bedarf {cost} Kekse",sweetBoost:"🍪 Süßer Bonus",boostInfo:"Nutze Boni auf dem Startbildschirm.",permanent:"Dauerhafte Upgrades",upgradeCost:"Für {cost} Kekse verbessern",production:"🏭 Produktionsupgrade",productionInfo:"Erhöhe Automatiköfen für mehr Produktion pro Sekunde.",achievements:[["Erster Teig","Den ersten Keks gebacken."],["Bäckerei-Eröffnung","Einen Hausofen gekauft."],["Ofensammler","5 Ofentypen im Besitz."],["Süßer Tausch","10 Schoko-Chips gesammelt."],["Neues Leben","Erste Wiedergeburt abgeschlossen."],["Neustart","Bäckerei nach Datenreset wieder eröffnet."]],secretAchievements:[["Mondbäcker","Den geheimen Ziehungsrekord erreicht."],["Duft der Unendlichkeit","Den Secret-Ofen erneut getroffen."]] },
  ru: { exchangeInfo:"Обменяйте 100 000 печений на 1 шоко-чип.",cookiesOwned:"Печений в наличии",exchangeOne:"Обменять 1",exchangeTen:"Обменять 10",exchangeAll:"Обменять всё",premiumExchange:"🍫 Премиум-обмен",premiumCost:"10 000 шоко-чипов → 1 премиум-чип",dictionaryCost:"1 000 000 шоко-чипов → 1 Словарь будущего",dictionaryExchange:"Обменять словарь",diaryCost:"3 словаря → 1 Дневник путешественника во времени",diaryCraft:"Создать дневник",rebirthInfo:"Каждое перерождение повышает нажатия и автопроизводство на 50%.",rebirthCost:"Перерождение {count} · Нужно {cost} печений",sweetBoost:"🍪 Сладкий бонус",boostInfo:"Используйте бонусы на главном экране.",permanent:"Постоянные улучшения",upgradeCost:"Улучшить за {cost} печений",production:"🏭 Улучшение производства",productionInfo:"Добавляйте автопечи для роста производства в секунду.",achievements:[["Первое тесто","Испекли первое печенье."],["Открытие пекарни","Купили домашнюю печь."],["Коллекционер печей","Есть 5 типов печей."],["Сладкий обмен","Собрали 10 шоко-чипов."],["Новая жизнь","Завершили первое перерождение."],["Новый старт","Открыли пекарню снова после сброса данных."]],secretAchievements:[["Лунный пекарь","Достигнут скрытый рекорд призывов."],["Аромат бесконечности","Снова встретили Secret-печь."]] },
};

type AccountText = { totalCookies:string; totalTaps:string; totalDraws:string; chips:string; premiumChips:string; rebirths:string; multiplier:string; nextMultiplier:string; rebirthKeeps:string; minutes:string; seconds:string };
export const accountText: Record<GameLanguage, AccountText> = {
  ko:{totalCookies:"누적 쿠키",totalTaps:"누적 터치",totalDraws:"누적 뽑기",chips:"초코칩",premiumChips:"프리미엄 초코칩",rebirths:"환생",multiplier:"현재 배율",nextMultiplier:"다음",rebirthKeeps:"현재 쿠키만 초기화되며 오븐, 자동화, 강화와 모든 영구 진행은 유지됩니다.",minutes:"분",seconds:"초"},
  en:{totalCookies:"Lifetime cookies",totalTaps:"Total taps",totalDraws:"Total draws",chips:"Choco chips",premiumChips:"Premium chips",rebirths:"Rebirths",multiplier:"Current multiplier",nextMultiplier:"Next",rebirthKeeps:"Only current cookies reset. Ovens, automation, upgrades, and all permanent progress remain.",minutes:"m",seconds:"s"},
  ja:{totalCookies:"累計クッキー",totalTaps:"累計タップ",totalDraws:"累計ガチャ",chips:"チョコチップ",premiumChips:"プレミアムチップ",rebirths:"転生",multiplier:"現在の倍率",nextMultiplier:"次",rebirthKeeps:"現在のクッキーのみ初期化され、オーブン、自動化、強化、恒久進行は維持されます。",minutes:"分",seconds:"秒"},
  zh:{totalCookies:"累计曲奇",totalTaps:"累计点击",totalDraws:"累计抽取",chips:"巧克力筹码",premiumChips:"高级筹码",rebirths:"转生",multiplier:"当前倍率",nextMultiplier:"下次",rebirthKeeps:"仅重置当前曲奇；烤炉、自动化、强化和所有永久进度都会保留。",minutes:"分",seconds:"秒"},
  ar:{totalCookies:"إجمالي الكعكات",totalTaps:"إجمالي النقرات",totalDraws:"إجمالي السحوبات",chips:"رقائق الشوكولاتة",premiumChips:"رقائق مميزة",rebirths:"الولادات",multiplier:"المضاعف الحالي",nextMultiplier:"التالي",rebirthKeeps:"يعاد ضبط الكعكات الحالية فقط، وتبقى الأفران والأتمتة والترقيات وكل التقدم الدائم.",minutes:"د",seconds:"ث"},
  de:{totalCookies:"Kekse gesamt",totalTaps:"Tipps gesamt",totalDraws:"Ziehungen gesamt",chips:"Schoko-Chips",premiumChips:"Premium-Chips",rebirths:"Wiedergeburten",multiplier:"Aktueller Multiplikator",nextMultiplier:"Nächster",rebirthKeeps:"Nur die aktuellen Kekse werden zurückgesetzt. Öfen, Automatik, Upgrades und permanenter Fortschritt bleiben.",minutes:"Min",seconds:"Sek"},
  ru:{totalCookies:"Всего печений",totalTaps:"Всего нажатий",totalDraws:"Всего призывов",chips:"Шоко-чипы",premiumChips:"Премиум-чипы",rebirths:"Перерождения",multiplier:"Текущий множитель",nextMultiplier:"Следующий",rebirthKeeps:"Сбрасываются только текущие печенья. Печи, автоматизация, улучшения и постоянный прогресс сохраняются.",minutes:"мин",seconds:"с"},
};

type AutomationText = { info: string; owned: string; perSecond: string };
export const automationText: Record<GameLanguage, AutomationText> = {
  ko: { info:"자동화 오븐은 초당 쿠키를 생산합니다. 판매 시 구매가의 80%를 돌려받습니다.",owned:"보유",perSecond:"초당" },
  en: { info:"Automation ovens bake cookies every second. Selling refunds 80% of the purchase cost.",owned:"Owned",perSecond:"per second" },
  ja: { info:"自動化オーブンは毎秒クッキーを生産します。売却時は購入額の80%が戻ります。",owned:"所持",perSecond:"毎秒" },
  zh: { info:"自动化烤炉每秒生产曲奇。出售可返还购买价格的 80%。",owned:"拥有",perSecond:"每秒" },
  ar: { info:"تنتج أفران الأتمتة الكعك كل ثانية. يمنح البيع 80% من سعر الشراء.",owned:"مملوك",perSecond:"كل ثانية" },
  de: { info:"Automatiköfen backen jede Sekunde Kekse. Beim Verkauf erhalten Sie 80% des Kaufpreises zurück.",owned:"Besitz",perSecond:"pro Sekunde" },
  ru: { info:"Автоматические печи производят печенье каждую секунду. Продажа возвращает 80% цены покупки.",owned:"Есть",perSecond:"в секунду" },
};
