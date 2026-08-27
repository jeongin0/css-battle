// 5-2. 캐스케이드 랭킹 로직 (진단 모드)
// 완전한 브라우저 매칭 엔진 재현이 아닌 "교육용 근사치" — UI에 명시한다.

import { calculateSpecificity, hasImportant, compareSpecificity } from './specificity.js';

// CSS 코드 블록을 규칙 단위로 파싱 (주석/미디어쿼리 등 복잡한 케이스는 근사 처리)
export function parseStylesheet(cssText) {
    const clean = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    const rules = [];
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    let order = 0;
    while ((match = ruleRe.exec(clean)) !== null) {
        const selectorGroup = match[1].trim();
        const body = match[2].trim();
        if (!selectorGroup || !body) continue;
        for (const selector of selectorGroup.split(',').map((s) => s.trim()).filter(Boolean)) {
            const spec = calculateSpecificity(selector);
            spec.important = hasImportant(body);
            rules.push({ selector, body, spec, order: order++ });
        }
    }
    return rules;
}

// 대상 조건과 마지막 컴파운드 셀렉터가 겹치는지로 매칭 판정 (근사치)
export function matchesTarget(selector, target) {
    const compounds = selector.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    const last = compounds[compounds.length - 1] || '';

    const ids = (last.match(/#[\w-]+/g) || []).map((t) => t.slice(1));
    const classes = (last.match(/\.[\w-]+/g) || []).map((t) => t.slice(1));
    const tagMatch = last.match(/^[a-zA-Z][\w-]*/);
    const tag = tagMatch ? tagMatch[0].toLowerCase() : null;
    const isUniversal = last === '*' || (!ids.length && !classes.length && !tag);

    if (target.id && ids.length && !ids.includes(target.id)) return false;
    if (ids.length && !target.id) return false;
    if (target.tag && tag && tag !== target.tag.toLowerCase()) return false;
    for (const cls of classes) {
        if (!target.classes.includes(cls)) return false;
    }
    if (isUniversal) return true;
    return ids.length > 0 || classes.length > 0 || tag !== null;
}

// target: { tag, id, classes: [] }
export function rankRules(cssText, target) {
    const matched = parseStylesheet(cssText).filter((rule) => matchesTarget(rule.selector, target));

    const ranked = [...matched].sort((a, b) => {
        const cmp = compareSpecificity(a.spec, b.spec);
        if (cmp !== 0) return -cmp;
        return b.order - a.order;
    });

    return ranked.map((rule, index) => ({
        ...rule,
        rank: index + 1,
        isWinner: index === 0,
        reason: buildReason(rule, ranked[0], index)
    }));
}

function buildReason(rule, winner, index) {
    if (index === 0) return '가장 높은 우선순위 — 이 규칙이 적용됩니다.';
    if (rule.spec.important !== winner.spec.important) {
        return '!important가 없어 밀립니다.';
    }
    const cmp = compareSpecificity(rule.spec, winner.spec);
    if (cmp < 0) return `특이도가 낮습니다 (${specText(rule.spec)} < ${specText(winner.spec)}).`;
    return '특이도는 같지만 소스 코드에서 더 먼저 등장해 밀립니다.';
}

function specText(spec) {
    return `${spec.inline},${spec.id},${spec.class},${spec.tag}`;
}
