// 5-5. 퀘스트 / 스트릭 계산 (날짜별 완료 기록 기반)

import { todayKey } from '../store.js';

// 슬롯은 항상 배틀·타자·디버그 3개. 목표치만 날짜에 따라 로테이션한다.
const QUEST_POOL = {
    battle: [
        { variant: 'w2', label: '배틀 2판 승리', target: 2 },
        { variant: 'w3', label: '배틀 3판 승리', target: 3 },
        { variant: 'w4', label: '배틀 4판 승리', target: 4 }
    ],
    typing: [
        { variant: 'a85', label: '타자연습 정확도 85%+ 1회', target: 85 },
        { variant: 'a90', label: '타자연습 정확도 90%+ 1회', target: 90 },
        { variant: 'a95', label: '타자연습 정확도 95%+ 1회', target: 95 }
    ],
    diagnose: [
        { variant: 'd1', label: 'CSS 디버그 1문제 해결', target: 1 },
        { variant: 'd2', label: 'CSS 디버그 2문제 해결', target: 2 },
        { variant: 'd3', label: 'CSS 디버그 3문제 해결', target: 3 }
    ]
};

// 슬롯별 고정 id — questLog 키와 채점 로직이 이 id에 의존한다.
const SLOTS = [
    { id: 'battle_3win', slot: 'battle' },
    { id: 'typing_90acc', slot: 'typing' },
    { id: 'diagnose_use', slot: 'diagnose' }
];

function dayNumber(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

// 그날의 퀘스트 3개 (목표치 로테이션). 같은 날짜면 항상 같은 결과.
export function dailyQuests(dateKey = todayKey()) {
    const n = dayNumber(dateKey);
    return SLOTS.map(({ id, slot }, i) => {
        const pool = QUEST_POOL[slot];
        return { id, slot, ...pool[(n + i) % pool.length] };
    });
}

export const STAMP_REWARDS = [
    { count: 3, title: '입문 스티커' },
    { count: 7, title: '캐스케이드 견습' },
    { count: 14, title: '특이도 장인' },
    { count: 30, title: 'CSS 챔피언' }
];

function shiftDays(dateKey, delta) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d + delta);
    return todayKey(date);
}

// 완료로 친 날짜 키 목록에서 {현재 연속, 최장 연속} 계산. 하루라도 비면 현재 연속 리셋.
function streakFromKeys(keys, today = todayKey()) {
    const set = new Set(keys);

    let current = 0;
    let cursor = set.has(today) ? today : shiftDays(today, -1);
    while (set.has(cursor)) {
        current += 1;
        cursor = shiftDays(cursor, -1);
    }

    const sorted = [...set].sort();
    let longest = 0;
    let run = 0;
    let prev = null;
    for (const key of sorted) {
        run = prev && shiftDays(prev, 1) === key ? run + 1 : 1;
        longest = Math.max(longest, run);
        prev = key;
    }

    return { current, longest: Math.max(longest, current) };
}

// 출석 스트릭 — 그날 사이트에 한 번이라도 들어왔으면 이어짐. visitLog: { 'YYYY-MM-DD': true }
export function calculateStreak(visitLog, today = todayKey()) {
    return streakFromKeys(Object.keys(visitLog || {}), today);
}

// 스탬프(★) = 그날 퀘스트 3개를 모두 완료한 날의 수
export function perfectDays(questLog) {
    return Object.values(questLog).filter((list) => (list || []).length >= SLOTS.length).length;
}

export function nextReward(stampCount) {
    const next = STAMP_REWARDS.find((r) => r.count > stampCount);
    if (!next) return null;
    return { ...next, remaining: next.count - stampCount };
}
