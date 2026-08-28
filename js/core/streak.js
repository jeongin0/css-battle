// 5-5. 퀘스트 / 스트릭 계산 (날짜별 완료 기록 기반)

import { todayKey } from '../store.js';

export const DAILY_QUESTS = [
    { id: 'battle_3win', label: '배틀 3판 승리' },
    { id: 'typing_90acc', label: '타자연습 정확도 90%+ 1회' },
    { id: 'diagnose_use', label: 'CSS 디버그 1문제 해결' }
];

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

// questLog: { 'YYYY-MM-DD': [questId, ...] }, 하루라도 비면 리셋
export function calculateStreak(questLog, requiredCount = 1, today = todayKey()) {
    const isDone = (key) => (questLog[key] || []).length >= requiredCount;

    let current = 0;
    let cursor = isDone(today) ? today : shiftDays(today, -1);
    while (isDone(cursor)) {
        current += 1;
        cursor = shiftDays(cursor, -1);
    }

    const doneKeys = Object.keys(questLog)
        .filter((key) => (questLog[key] || []).length >= requiredCount)
        .sort();
    let longest = 0;
    let run = 0;
    let prev = null;
    for (const key of doneKeys) {
        run = prev && shiftDays(prev, 1) === key ? run + 1 : 1;
        longest = Math.max(longest, run);
        prev = key;
    }

    return { current, longest: Math.max(longest, current) };
}

export function totalStamps(questLog, requiredCount = 1) {
    return Object.values(questLog).filter((list) => (list || []).length >= requiredCount).length;
}

export function nextReward(stampCount) {
    const next = STAMP_REWARDS.find((r) => r.count > stampCount);
    if (!next) return null;
    return { ...next, remaining: next.count - stampCount };
}
