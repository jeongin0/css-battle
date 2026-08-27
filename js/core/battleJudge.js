// 5-3. 배틀 모드 판정 로직
// Layer 2: 특이도 승패 판정 / Layer 3: 렌더링 결과(computed style) 시안 일치 판정

import { calculateSpecificity, hasImportant, compareSpecificity } from './specificity.js';

// "선택자 { 선언... }" 형태의 CSS 규칙 하나를 파싱
export function parseRule(cssText) {
    const match = cssText.match(/^\s*([^{]+)\{([\s\S]*)\}\s*$/);
    if (!match) return null;

    const selector = match[1].trim();
    const body = match[2].trim();
    if (!selector || !body) return null;

    const spec = calculateSpecificity(selector);
    spec.important = hasImportant(body);

    return { selector, body, spec };
}

export function judgeSpecificity(userCssText, opponentRuleText) {
    const userRule = parseRule(userCssText);
    if (!userRule) {
        return {
            valid: false,
            reason: '"선택자 { 속성: 값; }" 형태로 CSS 규칙 하나를 작성해주세요.'
        };
    }

    const opponentRule = parseRule(opponentRuleText);
    const cmp = compareSpecificity(userRule.spec, opponentRule.spec);

    return {
        valid: true,
        wonSpecificity: cmp > 0,
        tie: cmp === 0,
        userRule,
        opponentRule
    };
}

// 사용자 셀렉터가 대상 엘리먼트에 실제로 매칭되는지 확인 (브라우저 네이티브 엔진)
export function selectorMatchesTarget(doc, userSelector, targetSelector) {
    try {
        const targets = [...doc.querySelectorAll(targetSelector)];
        const matched = [...doc.querySelectorAll(userSelector)];
        return targets.length > 0 && targets.every((el) => matched.includes(el));
    } catch {
        return false;
    }
}

function toRgb(value) {
    const hex = value.trim().replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(hex)) {
        return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    }
    const m = value.match(/-?\d+(\.\d+)?/g);
    return m ? m.slice(0, 3).map(Number) : null;
}

function comparable(prop, expected, actual) {
    if (/color|background/.test(prop)) {
        const e = toRgb(expected);
        const a = toRgb(actual);
        if (!e || !a) return { ok: false };
        const ok = e.every((c, i) => Math.abs(c - a[i]) <= 12);
        return { ok };
    }
    const e = parseFloat(expected);
    const a = parseFloat(actual);
    if (!Number.isNaN(e) && !Number.isNaN(a)) {
        return { ok: Math.abs(e - a) <= 2 };
    }
    return { ok: String(expected).trim() === String(actual).trim() };
}

// expected: { [cssProp]: value }. doc는 사용자 CSS가 이미 적용된 iframe document.
export function judgeDesignMatch(doc, targetSelector, expected) {
    const el = doc.querySelector(targetSelector);
    if (!el) {
        return { matched: false, mismatches: [{ prop: '대상', expected: targetSelector, actual: '요소를 찾지 못함' }] };
    }
    const computed = doc.defaultView.getComputedStyle(el);
    const mismatches = [];
    for (const [prop, value] of Object.entries(expected)) {
        const actual = computed.getPropertyValue(prop);
        if (!comparable(prop, value, actual).ok) {
            mismatches.push({ prop, expected: value, actual: actual.trim() });
        }
    }
    return { matched: mismatches.length === 0, mismatches };
}

// 종합 판정: ① 특이도로 상대를 이김 AND ② 시안 일치
export function judgeBattle({ doc, userCssText, problem }) {
    const spec = judgeSpecificity(userCssText, problem.opponentRule);
    if (!spec.valid) return { valid: false, reason: spec.reason };

    const selectorMatches = selectorMatchesTarget(doc, spec.userRule.selector, problem.targetSelector);
    const design = judgeDesignMatch(doc, problem.targetSelector, problem.expectedStyles);

    const wonSpecificity = spec.wonSpecificity && selectorMatches;
    const result = wonSpecificity && design.matched ? 'win' : 'lose';

    return {
        valid: true,
        result,
        wonSpecificity,
        selectorMatches,
        tie: spec.tie,
        matchedDesign: design.matched,
        mismatches: design.mismatches,
        userRule: spec.userRule,
        opponentRule: spec.opponentRule
    };
}
