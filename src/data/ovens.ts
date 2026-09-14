export type Rarity = 'Common'|'Uncommon'|'Rare'|'Epic'|'Legendary'|'Mythic'|'Eternal'|'Celestial'|'Secret';
export type Oven = { id:string; name:string; rarity:Rarity; click:number; cps:number };
export const RARITY_COLORS: Record<Rarity,string>={Common:'#9a8069',Uncommon:'#4a9b67',Rare:'#3e86d8',Epic:'#9655cb',Legendary:'#ed9b26',Mythic:'#ee5478',Eternal:'#45c6cb',Celestial:'#b58af0',Secret:'#ff4dcc'};
const list:[string,Rarity,number,number][]=[
 ['점토 스타터 오븐','Common',1,1],['벽돌 화덕','Common',1.1,1.2],['틴 시트 오븐','Uncommon',1.25,1.5],['슈가 킬른','Uncommon',1.45,1.8],['코퍼 로터리 오븐','Rare',1.7,2.2],['스팀 랙 오븐','Rare',2,2.8],['카라멜 프레셔 오븐','Epic',2.6,3.5],['문스톤 오븐','Epic',3.2,4.3],['오로라 코어 오븐','Legendary',4,5.5],['드래곤 퍼니스','Legendary',5.5,7],['피닉스 크루서블','Mythic',7,9],['크로노 블룸 오븐','Mythic',9,12],['이터널 프리즘','Eternal',12,16],['이터널 아카이브','Eternal',16,22],['스타포지 오븐','Celestial',22,30],['보이드 렐릭','Celestial',30,42],['더 이터널 앱솔루트 인피니트 맥스카이터 오븐','Secret',95,95]
];
export const OVENS:Oven[]=list.map(([name,rarity,click,cps],i)=>({id:`oven-${i}`,name,rarity:rarity as Rarity,click,cps}));
