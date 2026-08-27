// 5-3. 배틀 모드 판정 로직 (Layer 2: 특이도 승패 판정만 우선 구현)

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

// Layer 2: 사용자 규칙 vs 상대 규칙의 특이도만 비교 (시안 일치 판정은 Layer 3에서 추가)
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
