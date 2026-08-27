// 배틀 채점
//  정확도 = "같아 보이나" : 요소별 위치·크기(getBoundingClientRect) + 칠(색/테두리/라운드/굵기)
//  정밀도 = 셀렉터 위생 : 컴포넌트 루트부터 잡았는지 + !important/*/죽은 규칙

import { parseStylesheet } from './cascade.js';
import { calculateSpecificity } from './specificity.js';

const CLEAR_THRESHOLD = 90;
const BOX_TOL = 4;

const PAINT_PROPS = [
    'background-color', 'color',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-left-radius', 'border-bottom-right-radius',
    'font-weight', 'font-style', 'text-decoration-line', 'text-align', 'opacity', 'box-shadow'
];

function rgb(value) {
    if (/transparent|^none$/.test(value)) return [0, 0, 0, 0];
    const m = String(value).match(/-?\d+(\.\d+)?/g);
    return m ? m.slice(0, 3).map(Number) : null;
}

function weightBucket(v) {
    const n = parseInt(v, 10) || 400;
    return n >= 600 ? 'bold' : n >= 500 ? 'medium' : 'normal';
}

function paintMatches(prop, expected, actual) {
    if (expected === actual) return true;
    if (prop === 'font-weight') return weightBucket(expected) === weightBucket(actual);
    if (prop === 'box-shadow') return (expected === 'none') === (actual === 'none');
    if (/color/.test(prop)) {
        const e = rgb(expected);
        const a = rgb(actual);
        if (!e || !a) return false;
        return e.every((c, i) => Math.abs(c - a[i]) <= 16);
    }
    if (/radius/.test(prop)) {
        const round = (v) => v.includes('%') ? parseFloat(v) >= 40 : parseFloat(v) >= 100;
        if (round(expected) && round(actual)) return true;
        return Math.abs(parseFloat(expected) - parseFloat(actual)) <= 2;
    }
    if (/width/.test(prop)) return Math.abs(parseFloat(expected) - parseFloat(actual)) <= 1.5;
    return String(expected).trim() === String(actual).trim();
}

function elLabel(el) {
    const cls = el.getAttribute('class');
    return cls ? `.${cls.trim().split(/\s+/)[0]}` : el.tagName.toLowerCase();
}

function relRect(el, originRect) {
    const r = el.getBoundingClientRect();
    return { x: r.left - originRect.left, y: r.top - originRect.top, w: r.width, h: r.height };
}

// 같은 html을 렌더한 3개 문서 → 요소 트리 인덱스 정렬됨
export function scoreAccuracy({ userDoc, answerDoc, baseDoc }) {
    const aEls = [...answerDoc.body.querySelectorAll('*')].filter((el) => !/SCRIPT|STYLE/.test(el.tagName));
    const uEls = [...userDoc.body.querySelectorAll('*')].filter((el) => !/SCRIPT|STYLE/.test(el.tagName));
    const bEls = [...baseDoc.body.querySelectorAll('*')].filter((el) => !/SCRIPT|STYLE/.test(el.tagName));

    const aWin = answerDoc.defaultView;
    const uWin = userDoc.defaultView;
    const bWin = baseDoc.defaultView;
    const aOrigin = answerDoc.body.getBoundingClientRect();
    const uOrigin = userDoc.body.getBoundingClientRect();

    let total = 0;
    let passed = 0;
    const mismatches = [];

    aEls.forEach((aEl, i) => {
        const uEl = uEls[i];
        const bEl = bEls[i];
        if (!uEl) return;
        const label = elLabel(aEl);

        const ar = relRect(aEl, aOrigin);
        const ur = relRect(uEl, uOrigin);
        [['x', ar.x, ur.x], ['y', ar.y, ur.y], ['너비', ar.w, ur.w], ['높이', ar.h, ur.h]].forEach(([k, av, uv]) => {
            total += 1;
            if (Math.abs(av - uv) <= BOX_TOL) passed += 1;
            else mismatches.push({ label, prop: `위치·크기(${k})`, expected: `${Math.round(av)}px`, actual: `${Math.round(uv)}px` });
        });

        const acs = aWin.getComputedStyle(aEl);
        const ucs = uWin.getComputedStyle(uEl);
        const bcs = bWin.getComputedStyle(bEl || aEl);
        for (const p of PAINT_PROPS) {
            const av = acs.getPropertyValue(p).trim();
            const bv = bcs.getPropertyValue(p).trim();
            if (av === bv) continue; // 시안이 기본값에서 바꾸지 않은 속성은 채점 안 함
            total += 1;
            const uv = ucs.getPropertyValue(p).trim();
            if (paintMatches(p, av, uv)) passed += 1;
            else mismatches.push({ label, prop: p, expected: av, actual: uv });
        }
    });

    const percent = total === 0 ? 100 : Math.round((passed / total) * 100);
    return { percent, cleared: percent >= CLEAR_THRESHOLD, mismatches, threshold: CLEAR_THRESHOLD };
}

function safeQueryAll(doc, sel) {
    try { return [...doc.querySelectorAll(sel)]; } catch { return []; }
}

// cssText: 사용자 CSS / doc: 사용자 CSS 적용 문서 / rootClass: 컴포넌트 루트 클래스명
export function scorePrecision(cssText, doc, rootClass) {
    const rules = parseStylesheet(cssText);
    const deductions = [];

    if (!rules.length) {
        return { score: 0, deductions: [{ reason: 'CSS 없음', points: 100 }], rules: [] };
    }

    const rootRe = rootClass ? new RegExp(`\\.${rootClass.replace(/-/g, '\\-')}(?![\\w-])`) : null;

    for (const rule of rules) {
        const sel = rule.selector;
        const matched = safeQueryAll(doc, sel);

        const importants = (rule.body.match(/!\s*important/gi) || []).length;
        if (importants) deductions.push({ reason: '!important 사용', detail: sel, points: 8 * importants });

        if (/(^|[\s>+~(])\*(?![=\]])/.test(sel)) {
            deductions.push({ reason: '전체 선택자(*) 사용', detail: sel, points: 10 });
        }

        const ids = (sel.match(/#[\w-]+/g) || []).length;
        if (ids) deductions.push({ reason: '스타일에 ID 선택자 사용', detail: sel, points: 4 * ids });

        if (matched.length === 0) {
            deductions.push({ reason: '아무 요소도 선택하지 않는 규칙', detail: sel, points: 6 });
        } else if (rootRe && !rootRe.test(sel)) {
            // 루트를 앵커로 쓰지 않음 → 다른 곳의 같은 클래스에도 적용될 수 있음
            deductions.push({
                reason: `컴포넌트 루트(.${rootClass})부터 시작하지 않음`,
                detail: `${sel} → .${rootClass} ${sel} 처럼`,
                points: 5
            });
        }
    }

    const lost = deductions.reduce((s, d) => s + d.points, 0);
    return { score: Math.max(0, 100 - lost), deductions, rules };
}

export function rootClassOf(problem) {
    if (problem.root) return problem.root;
    const m = problem.html.match(/class="([^"\s]+)/);
    return m ? m[1] : null;
}

export function precisionPar(problem) {
    const fake = { querySelectorAll: () => [{ matches: () => true }] };
    return scorePrecision(problem.answerCss, fake, rootClassOf(problem)).score;
}
