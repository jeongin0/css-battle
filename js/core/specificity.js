// 5-1. CSS 셀렉터 특이도 계산 (교육용 근사치 — :not() 내부 인자의 특이도는 반영하지 않음)

const TOKEN_RE = /(#[\w-]+)|(\.[\w-]+)|(\[[^\]]*\])|(::[\w-]+)|(:[\w-]+(?:\([^()]*\))?)|([a-zA-Z][\w-]*)|(\*)/y;

export function calculateSpecificity(selector) {
    const compounds = selector
        .replace(/[>+~]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    let id = 0;
    let cls = 0;
    let tag = 0;

    for (const compound of compounds) {
        let idx = 0;
        while (idx < compound.length) {
            TOKEN_RE.lastIndex = idx;
            const m = TOKEN_RE.exec(compound);
            if (!m) break;

            if (m[1]) id += 1;
            else if (m[2] || m[3] || m[5]) cls += 1;
            else if (m[4] || m[6]) tag += 1;

            idx = TOKEN_RE.lastIndex;
        }
    }

    return { inline: 0, id, class: cls, tag };
}

export function hasImportant(declarationText) {
    return /!\s*important/i.test(declarationText);
}

// a, b: { inline, id, class, tag, important }
export function compareSpecificity(a, b) {
    if (a.important !== b.important) return a.important ? 1 : -1;
    if (a.inline !== b.inline) return a.inline - b.inline;
    if (a.id !== b.id) return a.id - b.id;
    if (a.class !== b.class) return a.class - b.class;
    return a.tag - b.tag;
}
