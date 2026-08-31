const STORAGE_KEY = 'cssBattleData';

// 리포트(누적 통계)를 걷어내고, 퀘스트·스탬프에 필요한 "그날 활동량"만 남긴다.
// dayStats: { 'YYYY-MM-DD': { battle: 완료 판수, typingAcc: 그날 최고 정확도, diagnose: 해결 문제수 } }
const DEFAULT_STATE = {
    dayStats: {},
    questLog: {},
    visitLog: {},
    streak: { current: 0, longest: 0 },
    settings: { difficulty: 'low' }
};

const EMPTY_DAY = { battle: 0, typingAcc: 0, diagnose: 0 };

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    try {
        return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
    } catch {
        return structuredClone(DEFAULT_STATE);
    }
}

let state = loadState();
const subscribers = new Set();

export function getState() {
    return state;
}

export function setState(partial) {
    state = { ...state, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    subscribers.forEach((fn) => fn(state));
}

export function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
}

export function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function getDayStat(dateKey = todayKey()) {
    return { ...EMPTY_DAY, ...(state.dayStats[dateKey] || {}) };
}

function patchDay(dateKey, patch) {
    const day = { ...EMPTY_DAY, ...(state.dayStats[dateKey] || {}), ...patch };
    setState({ dayStats: { ...state.dayStats, [dateKey]: day } });
}

export function addBattleClear(dateKey = todayKey()) {
    patchDay(dateKey, { battle: getDayStat(dateKey).battle + 1 });
}

export function reportTypingAccuracy(accuracy, dateKey = todayKey()) {
    patchDay(dateKey, { typingAcc: Math.max(getDayStat(dateKey).typingAcc, Math.round(accuracy) || 0) });
}

export function addDiagnoseSolved(dateKey = todayKey()) {
    patchDay(dateKey, { diagnose: getDayStat(dateKey).diagnose + 1 });
}

export function setDifficulty(difficulty) {
    setState({ settings: { ...state.settings, difficulty } });
}

export function markQuestDone(questId, dateKey = todayKey()) {
    const done = new Set(state.questLog[dateKey] || []);
    done.add(questId);
    setState({ questLog: { ...state.questLog, [dateKey]: [...done] } });
}

export function markVisit(dateKey = todayKey()) {
    if (state.visitLog[dateKey]) return;
    setState({ visitLog: { ...state.visitLog, [dateKey]: true } });
}

export function setStreak(streak) {
    setState({ streak });
}
