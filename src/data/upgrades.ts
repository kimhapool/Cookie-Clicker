export type Upgrade = {
  id: "click" | "cps" | "global";
  emoji: string;
  name: string;
  description: string;
  baseCost: number;
  growth: number;
  multiplier: number;
};

export const UPGRADES: Upgrade[] = [
  {
    id: "click",
    emoji: "👆",
    name: "장인의 손끝",
    description: "쿠키 클릭 보상이 단계마다 20% 증가합니다.",
    baseCost: 750,
    growth: 1.85,
    multiplier: 1.2,
  },
  {
    id: "cps",
    emoji: "⚙️",
    name: "황금 컨베이어",
    description: "자동화 생산량이 단계마다 25% 증가합니다.",
    baseCost: 2500,
    growth: 1.9,
    multiplier: 1.25,
  },
  {
    id: "global",
    emoji: "✨",
    name: "달콤한 유약",
    description: "모든 생산량이 단계마다 10% 증가합니다.",
    baseCost: 8000,
    growth: 2.05,
    multiplier: 1.1,
  },
];
