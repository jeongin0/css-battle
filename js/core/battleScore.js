// 배틀 채점: 정확도(computed style 비교) + 정밀도(셀렉터 위생)

import { parseStylesheet } from './cascade.js';
import { calculateSpecificity } from './specificity.js';

const CLEAR_THRESHOLD = 90;

const LEAK_PROPS = [
    'color', 'background-color', 'font-size', 'font-weight',
    'padding-left', 'padding-top', 'margin-left', 'margin-top',
    'border-top-width', 'border-radius', 'display', 'text-decoration-line'
];

function rgb(value) {
    const m = String(value).match(/-?\d+(\.\d+)?/g);
    return m ? m.slice(0, 3).map(Number) : null;
}

function propMatches(prop, expected, actual) {
    if (expected === actual) return true;
    if (/color/.test(prop)) {
        const e = rgb(expected);
        const a = rgb(actual);
        return !!e && !!a && e.every((c, i) => Math.abs(c - a[i]) <= 12);
    }
    if (/width|height|size|gap|radius|top$|left$|right$|bottom$|margin|padding|spacing/.test(prop)) {
        const e = parseFloat(expected);
        const a = parseFloat(actual);
        if (!Number.isNaN(e) && !Number.isNaN(a)) return Math.abs(e - a) <= 1.5;
    }
    return String(expected).trim() === String(actual).trim();
}

function read(doc, sel, prop) {
    const elArr = safeQueryAll(doc, sel);
    if (!elArr.length) return null;
    return doc.defaultView.getComputedStyle(elArr[0]).getPropertyValue(prop).trim();
}

function safeQueryAll(doc, sel) {
    try { return [...doc.querySelectorAll(sel)]; } catch { return []; }
}

// userDoc: 사용자 CSS 적용 / answerDoc: 정답 CSS 적용 / baseDoc: CSS 없음
export function scoreAccuracy({ userDoc, answerDoc, baseDoc, problem }) {
    let total = 0;
    let passed = 0;
    const mismatches = [];

    for (const { sel, props } of problem.check) {
        for (const prop of props) {
            const expected = read(answerDoc, sel, prop);
            const actual = read(userDoc, sel, prop);
            if (expected === null) continue;
            total += 1;
            if (actual !== null && propMatches(prop, expected, actual)) {
                passed += 1;
            } else {
                mismatches.push({ sel, prop, expected, actual: actual ?? '(요소 없음)' });
            }
        }
    }

    const leaks = [];
    for (const sel of problem.keepDefault || []) {
        for (const prop of LEAK_PROPS) {
            const baseVal = read(baseDoc, sel, prop);
            const userVal = read(userDoc, sel, prop);
            if (baseVal !== null && userVal !== null && !propMatches(prop, baseVal, userVal)) {
                leaks.push({ sel, prop, base: baseVal, actual: userVal });
                total += 1;
            }
        }
    }

    const percent = total === 0 ? 100 : Math.round((passed / total) * 100);
    return { percent, cleared: percent >= CLEAR_THRESHOLD, mismatches, leaks, threshold: CLEAR_THRESHOLD };
}

function compoundCount(selector) {
    return selector.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean).length;
}

// cssText: 사용자 CSS / doc: 사용자 CSS 적용 문서(죽은 규칙 판정용)
export function scorePrecision(cssText, doc) {
    const rules = parseStylesheet(cssText);
    const deductions = [];
    const declSeen = new Map();

    if (!rules.length) {
        return { score: 0, par: 100, deductions: [{ reason: 'CSS 없음', points: 100 }], rules: [] };
    }

    for (const rule of rules) {
        const sel = rule.selector;

        const importants = (rule.body.match(/!\s*important/gi) || []).length;
        if (importants) deductions.push({ reason: '!important 사용', detail: sel, points: 8 * importants });

        if (/(^|[\s>+~(])\*(?![=\]])/.test(sel)) {
            deductions.push({ reason: '전체 선택자(*) 사용', detail: sel, points: 10 });
        }

        const ids = (sel.match(/#[\w-]+/g) || []).length;
        if (ids) deductions.push({ reason: '스타일에 ID 선택자 사용', detail: sel, points: 5 * ids });

        if (compoundCount(sel) > 3) {
            deductions.push({ reason: '3단계 초과 깊은 체이닝', detail: sel, points: 4 });
        }

        const spec = calculateSpecificity(sel);
        if (spec.class + spec.id * 3 >= 4) {
            deductions.push({ reason: '과잉 특이도', detail: `${sel} (0,${spec.id},${spec.class},${spec.tag})`, points: 3 });
        }

        if (safeQueryAll(doc, sel).length === 0) {
            deductions.push({ reason: '아무 요소도 선택하지 않는 규칙', detail: sel, points: 6 });
        }

        for (const decl of rule.body.split(';')) {
            const [p, v] = decl.split(':');
            if (!p || !v) continue;
            const key = `${p.trim()}:${v.trim().replace(/!\s*important/i, '').trim()}`;
            declSeen.set(key, (declSeen.get(key) || 0) + 1);
        }
    }

    for (const [key, count] of declSeen) {
        if (count > 1) deductions.push({ reason: '동일 선언 중복', detail: key, points: 3 * (count - 1) });
    }

    const lost = deductions.reduce((s, d) => s + d.points, 0);
    return { score: Math.max(0, 100 - lost), deductions, rules };
}

export function precisionPar(problem) {
    // 정답 CSS의 정밀도 = par. 정답 문서 없이도 셀렉터가 유효하다고 보고 죽은 규칙 검사는 생략.
    const fake = { querySelectorAll: () => [{}] };
    return scorePrecision(problem.answerCss, fake).score;
}
