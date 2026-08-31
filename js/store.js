const STORAGE_KEY = 'cssBattleData';

const DEFAULT_STATE = {
    battleRecords: [],
    typingRecords: [],
    diagnoseRecords: [],
    questLog: {},
    visitLog: {},
    streak: { current: 0, longest: 0 },
    settings: { difficulty: 'low' }
};

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

export function addBattleRecord(record) {
    const full = { date: todayKey(), ...record };
    setState({ battleRecords: [...state.battleRecords, full] });
    return full;
}

export function addTypingRecord(record) {
    const full = { date: todayKey(), ...record };
    setState({ typingRecords: [...state.typingRecords, full] });
    return full;
}

export function addDiagnoseRecord(record = {}) {
    const full = { date: todayKey(), ...record };
    setState({ diagnoseRecords: [...(state.diagnoseRecords || []), full] });
    return full;
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
