// 배틀 자기평가
//  - 시안 일치(정확도)는 "정답이 하나가 아니라" 채점하지 않는다. 겹쳐보기 + 예시 정답으로 사용자가 직접 확인.
//  - 셀렉터 위생만 객관적으로 체크리스트로 보여준다 (점수 X, 통과/주의만).

import { parseStylesheet } from './cascade.js';
import { calculateSpecificity } from './specificity.js';

function safeQueryAll(doc, sel) {
    try { return [...doc.querySelectorAll(sel)]; } catch { return []; }
}

function depthOf(selector) {
    return selector.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean).length;
}

// cssText: 사용자 CSS / doc: 사용자 CSS 적용 문서 / rootClass: 컴포넌트 루트 클래스명
export function selectorHygiene(cssText, doc, rootClass) {
    const rules = parseStylesheet(cssText).map((r) => ({
        selector: r.selector,
        spec: calculateSpecificity(r.selector)
    }));

    if (!rules.length) {
        return { rules, checks: [], empty: true };
    }

    const rootRe = rootClass ? new RegExp(`\\.${rootClass.replace(/-/g, '\\-')}(?![\\w-])`) : null;

    const withImportant = [];
    const withId = [];
    const withUniversal = [];
    const dead = [];
    const notAnchored = [];
    const tooDeep = [];

    for (const rule of parseStylesheet(cssText)) {
        const sel = rule.selector;
        if (/!\s*important/i.test(rule.body)) withImportant.push(sel);
        if (/#[\w-]+/.test(sel)) withId.push(sel);
        if (/(^|[\s>+~(])\*(?![=\]])/.test(sel)) withUniversal.push(sel);
        if (safeQueryAll(doc, sel).length === 0) dead.push(sel);
        else if (rootRe && !rootRe.test(sel)) notAnchored.push(sel);
        if (depthOf(sel) > 3) tooDeep.push(sel);
    }

    const check = (label, offenders, hint) => ({
        label,
        ok: offenders.length === 0,
        detail: offenders.length ? `${[...new Set(offenders)].join(', ')} — ${hint}` : ''
    });

    const checks = [
        check('!important 없이 해결', withImportant, '특이도로 이겨보세요'),
        check('스타일에 ID 선택자 미사용', withId, '재사용을 막습니다. 클래스로'),
        check('전체 선택자(*) 미사용', withUniversal, '의도치 않은 요소까지 잡힙니다'),
        check('죽은 규칙 없음', dead, '아무 요소도 선택하지 않습니다'),
        rootClass
            ? check(`컴포넌트 루트(.${rootClass})부터 시작`, notAnchored, `.${rootClass} 안으로 범위를 좁히세요`)
            : null,
        check('3단계 이하의 얕은 셀렉터', tooDeep, '체이닝이 깊으면 깨지기 쉽습니다')
    ].filter(Boolean);

    return { rules, checks, empty: false };
}
