export type Building={id:string;name:string;emoji:string;baseCost:number;baseCps:number};
export const BUILDINGS:Building[]=[
 {id:'grandma_oven',name:'가정용 오븐',emoji:'🏠',baseCost:100,baseCps:1},
 {id:'bakery',name:'동네 제과점',emoji:'🥐',baseCost:1200,baseCps:12},
 {id:'cookie_factory',name:'쿠키 공장',emoji:'🏭',baseCost:15000,baseCps:150},
 {id:'assembly_line',name:'조립 라인',emoji:'⚙️',baseCost:180000,baseCps:1800},
 {id:'research_lab',name:'연구소',emoji:'🔬',baseCost:2200000,baseCps:22000},
 {id:'space_bakery',name:'우주 베이커리',emoji:'🚀',baseCost:28000000,baseCps:280000}
];
