const STORAGE_KEY = 'cssBattleData';

const DEFAULT_STATE = {
    battleRecords: [],
    typingRecords: [],
    questLog: {},
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
