export type MissionId =
  | "tap"
  | "stockpile"
  | "building"
  | "chip"
  | "draw"
  | "upgrade"
  | "rebirth"
  | "lifetime";

export type MissionDefinition = {
  id: MissionId;
  title: string;
  target: number;
  reward: string;
};

type MissionProgress = {
  taps: number;
  cookies: number;
  buildings: Record<string, number>;
  chocoChips: number;
  totalDraws: number;
  upgrades: Record<string, number>;
  rebirths: number;
  totalCookies: number;
};

export function getMissionProgress(id: MissionId, state: MissionProgress): number {
  switch (id) {
    case "tap": return state.taps;
    case "stockpile": return state.cookies;
    case "building": return Object.values(state.buildings).reduce((a, b) => a + b, 0);
    case "chip": return state.chocoChips;
    case "draw": return state.totalDraws;
    case "upgrade": return Object.values(state.upgrades).reduce((a, b) => a + b, 0);
    case "rebirth": return state.rebirths;
    case "lifetime": return state.totalCookies;
  }
}

export const MISSIONS: MissionDefinition[] = [
  { id: "tap", title: "쿠키 100회 굽기", target: 100, reward: "쿠키 500개" },
  {
    id: "stockpile",
    title: "쿠키 100,000개 보유하기",
    target: 100000,
    reward: "초코칩 2개",
  },
  {
    id: "building",
    title: "자동화 오븐 15개 구매하기",
    target: 15,
    reward: "초코칩 3개",
  },
  { id: "chip", title: "초코칩 20개 모으기", target: 20, reward: "쿠키 2,000개" },
  { id: "draw", title: "오븐 10회 뽑기", target: 10, reward: "초코칩 3개" },
  { id: "upgrade", title: "영구 강화 1회 완료", target: 1, reward: "쿠키 4,000개" },
  { id: "rebirth", title: "첫 환생 완료", target: 1, reward: "프리미엄 초코칩 1개" },
  {
    id: "lifetime",
    title: "누적 쿠키 1,000,000개 생산",
    target: 1000000,
    reward: "미래를 담은 사전 1권",
  },
];
