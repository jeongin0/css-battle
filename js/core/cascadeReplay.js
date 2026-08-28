// 진단 모드 "판정 리플레이" 엔진
// 가르치는 개념(매칭 → !important 층 → 특이도 튜플 → 소스 순서)은 정확하게 재현하고,
// 특이도가 아닌 CSS 기능(@media·@layer·상속 등)은 계산에서 분리하고 알림으로만 표시한다.

import { calculateSpecificity, hasImportant } from './specificity.js';

const COL_KR = ['인라인', 'ID', '클래스', '태그'];

// ---------- 파싱 ----------

function approxFeatures(selector) {
    const feats = [];
    if (/:not\(/i.test(selector)) feats.push(':not()');
    if (/:is\(/i.test(selector)) feats.push(':is()');
    if (/:where\(/i.test(selector)) feats.push(':where()');
    if (/:has\(/i.test(selector)) feats.push(':has()');
    if (/:nth-[\w-]+\(/i.test(selector)) feats.push(':nth-*()');
    if (/[+~]/.test(selector)) feats.push('형제 결합자');
    return feats;
}

export function parseRich(cssText) {
    const noComments = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

    const atRules = [];
    const atRe = /@(media|supports|layer|scope|container|keyframes|font-face|import|charset|namespace)\b[^{;]*/gi;
    let am;
    while ((am = atRe.exec(noComments)) !== null) {
        atRules.push({ name: '@' + am[1].toLowerCase(), text: am[0].trim().replace(/\s+/g, ' ') });
    }

    const rules = [];
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    let order = 0;
    while ((m = ruleRe.exec(noComments)) !== null) {
        const selectorGroup = m[1].trim();
        const body = m[2].trim();
        if (!selectorGroup || !body) continue;
        if (selectorGroup.startsWith('@')) continue;
        for (const selector of selectorGroup.split(',').map((s) => s.trim()).filter(Boolean)) {
            const s = calculateSpecificity(selector);
            const important = hasImportant(body);
            const spec = { inline: s.inline, id: s.id, class: s.class, tag: s.tag, important };
            rules.push({ selector, body, spec, important, order: order++, approx: approxFeatures(selector) });
        }
    }

    let leftover = noComments
        .replace(/([^{}]+)\{([^{}]*)\}/g, '')
        .replace(/@[^{};]*[{;]?/g, '')
        .replace(/[{}]/g, '')
        .trim();
    if (leftover.length > 120) leftover = leftover.slice(0, 120) + '…';

    return { rules, atRules, leftover: leftover || null };
}

// ---------- 매칭 ----------

function parseCompound(compound) {
    // 매칭 판정에서는 :not()/:is()/:where()/:has()/:nth-*() 인자를 무시 (근사) — 특이도는 별도 계산
    compound = compound.replace(/:(?:not|is|where|has|nth-[\w-]+)\([^)]*\)/gi, '');
    const ids = (compound.match(/#[\w-]+/g) || []).map((t) => t.slice(1));
    const classes = (compound.match(/\.[\w-]+/g) || []).map((t) => t.slice(1));
    const tagMatch = compound.match(/^[a-zA-Z][\w-]*/);
    const tag = tagMatch ? tagMatch[0].toLowerCase() : null;
    return { ids, classes, tag };
}

function compoundVsElement(compound, elm) {
    const { ids, classes, tag } = parseCompound(compound);
    if (tag && elm.tag && tag !== elm.tag.toLowerCase()) {
        return { ok: false, reason: `<${tag}> 태그를 요구하지만 대상은 <${elm.tag}>` };
    }
    if (ids.length) {
        if (!elm.id) return { ok: false, reason: `#${ids[0]} 를 요구하지만 대상에 ID가 없음` };
        if (!ids.includes(elm.id)) return { ok: false, reason: `#${ids.join(', #')} 를 요구하지만 대상 ID는 #${elm.id}` };
    }
    for (const c of classes) {
        if (!elm.classes.includes(c)) return { ok: false, reason: `.${c} 를 요구하지만 대상에 없음` };
    }
    return { ok: true };
}

function ancestorSatisfies(compound, ancestors) {
    return ancestors.some((a) => compoundVsElement(compound, {
        tag: a.tag || null, id: a.id || null, classes: a.classes || []
    }).ok);
}

// target: { el, root } (정확) 또는 { tag, id, classes: [], ancestors: [{tag,id,classes}] } (근사)
export function matchInfo(selector, target) {
    // HTML을 받은 경우: 브라우저 엔진으로 정확히 판정
    if (target.el && target.root) {
        let list;
        try {
            list = target.root.querySelectorAll(selector);
        } catch (e) {
            return { matched: false, reason: '셀렉터 문법 오류로 브라우저가 무시함' };
        }
        return [...list].includes(target.el)
            ? { matched: true, reason: '브라우저 엔진 확인 — 대상에 실제 적용됨' }
            : { matched: false, reason: '브라우저 엔진 확인 — 대상에는 적용되지 않음' };
    }

    const parts = selector.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const anc = parts.slice(0, -1);
    const elm = { tag: target.tag || null, id: target.id || null, classes: target.classes || [] };

    const direct = compoundVsElement(last, elm);
    if (!direct.ok) return { matched: false, reason: direct.reason };

    if (anc.length) {
        const ancestors = target.ancestors || [];
        if (!ancestors.length) {
            return { matched: true, approx: true, reason: '대상 자체는 일치 · 조상 조건은 확인 불가(근사)' };
        }
        for (const c of anc) {
            if (!ancestorSatisfies(c, ancestors)) {
                return { matched: false, reason: `조상 조건 "${c}" 를 만족하는 요소가 대상 위에 없음` };
            }
        }
        return { matched: true, reason: '대상 + 조상 조건 모두 일치' };
    }
    return { matched: true, reason: '대상과 직접 일치' };
}

// ---------- 특이도 비교 ----------

function tupleArr(spec) {
    return [spec.inline, spec.id, spec.class, spec.tag];
}

function cmpTuple(a, b) {
    const A = tupleArr(a);
    const B = tupleArr(b);
    for (let i = 0; i < 4; i += 1) {
        if (A[i] !== B[i]) return A[i] - B[i];
    }
    return 0;
}

function decidingIndex(a, b) {
    const A = tupleArr(a);
    const B = tupleArr(b);
    for (let i = 0; i < 4; i += 1) {
        if (A[i] !== B[i]) return i;
    }
    return -1;
}

function sortLayer(arr) {
    return [...arr].sort((a, b) => {
        const c = cmpTuple(a.spec, b.spec);
        if (c !== 0) return -c;
        return b.order - a.order; // 나중에 선언된 규칙이 앞
    });
}

function ruleText(r) {
    return `${r.selector} { ${r.body} }`;
}

// ---------- 오개념 감지 ----------

function detectMyths(winner, runnerUp, matched) {
    const myths = [];
    if (!winner) return myths;

    if (winner.important) {
        const higher = matched.find((r) => !r.important && cmpTuple(r.spec, winner.spec) > 0);
        if (higher) {
            myths.push(`"!important 는 특이도 점수를 높인다" → ❌ 특이도가 (${tupleArr(winner.spec).join(',')}) 로 더 낮은 <code>${winner.selector}</code> 가, (${tupleArr(higher.spec).join(',')}) 인 <code>${higher.selector}</code> 를 이겼습니다. !important 는 점수가 아니라 별도 층입니다.`);
        }
    }

    if (runnerUp && !winner.important) {
        const dec = decidingIndex(winner.spec, runnerUp.spec);
        if (dec === 1 && runnerUp.spec.class > winner.spec.class) {
            myths.push(`"클래스를 여러 개 붙이면 ID를 이긴다" → ❌ <code>${runnerUp.selector}</code> 는 class 자리가 ${runnerUp.spec.class} 로 더 많지만, ID 자리에서 먼저 갈려 class 자리는 비교에 들어오지도 않았습니다.`);
        }
        if (dec === -1) {
            myths.push('"먼저 작성한 규칙이 우선한다" → ❌ 특이도가 같으면 <b>나중에</b> 온 규칙이 이깁니다.');
        }
        if (dec >= 0 && runnerUp.selector.length > winner.selector.length + 4) {
            myths.push(`"더 길고 구체적으로 보이는 셀렉터가 이긴다" → ❌ 길이가 아니라 자릿수입니다. 짧은 <code>${winner.selector}</code> 가 이겼습니다.`);
        }
    }

    if (myths.length === 0) {
        myths.push('특이도 네 자리를 왼쪽(강한 자리)부터 비교하면 그대로 결과가 나옵니다. 왼쪽에서 승부가 나면 오른쪽 자리는 읽지 않습니다.');
    }
    return myths;
}

// ---------- 가장 싼 승리법 ----------

function cheapestWin(loser, winner) {
    if (!loser || !winner || loser === winner) return null;
    const options = [];

    if (winner.important && !loser.important) {
        options.push({ kind: 'bad', verdict: '✗ 특이도로는 불가', label: '셀렉터를 더 구체적으로', note: '!important 층은 특이도를 아무리 올려도 못 넘습니다.' });
        options.push({ kind: 'warn', verdict: '⚠ 비권장', label: '같은 선언에 !important 추가', note: '충돌이 한 겹 더 쌓입니다. 다음 개발자가 같은 문제를 겪어요.' });
        options.push({ kind: 'good', verdict: '✓ 권장', label: `${winner.selector} 의 !important 제거`, note: '그러면 특이도 규칙으로 정상 판정됩니다.' });
        return { ruleLabel: loser.selector, options };
    }

    const dec = decidingIndex(loser.spec, winner.spec);
    if (dec === -1) {
        options.push({ kind: 'good', verdict: '✓ 최소 비용', label: `규칙을 ${winner.selector} 아래로 이동`, note: '특이도 동점이라 소스 순서만 뒤집으면 이깁니다.' });
        options.push({ kind: 'warn', verdict: '⚠', label: '특이도를 한 단계 올리기', note: '예: 조상 클래스 하나를 앞에 추가.' });
        options.push({ kind: 'bad', verdict: '✗ 비권장', label: '!important 추가', note: '동점을 이기려고 !important 를 쓰면 되돌리기 어려워집니다.' });
        return { ruleLabel: loser.selector, options };
    }

    const gap = tupleArr(winner.spec)[dec] - tupleArr(loser.spec)[dec];
    if (dec === 1) {
        options.push({ kind: 'good', verdict: '✓', label: `셀렉터에 #id 를 ${gap}개 포함`, note: '클래스·태그를 더 붙여도 ID 자리를 못 넘습니다.' });
    } else if (dec === 2) {
        options.push({ kind: 'good', verdict: '✓', label: `.class · [attr] · :pseudo 를 ${gap}개 추가`, note: 'ID 자리가 동률일 때만 유효합니다.' });
    } else if (dec === 3) {
        options.push({ kind: 'good', verdict: '✓', label: `태그 셀렉터 ${gap}개 추가`, note: '가장 약한 자리 — 위 자리들이 모두 동률일 때만.' });
    } else {
        options.push({ kind: 'warn', verdict: '⚠', label: '인라인 style 사용', note: '권장하지 않습니다.' });
    }
    const weaker = COL_KR[dec + 1];
    options.push({ kind: 'bad', verdict: '✗ 소용없음', label: weaker ? `${weaker} 자리만 키우기` : '더 약한 자리 키우기', note: '결정 자리보다 약한 자리는 결과에 영향이 없습니다.' });
    options.push({ kind: 'warn', verdict: '⚠ 비권장', label: '!important 추가', note: '동작하지만 다음 충돌을 부릅니다.' });
    return { ruleLabel: loser.selector, options };
}

// ---------- 메인 ----------

export function diagnoseCascade(cssText, target) {
    const parsed = parseRich(cssText);
    const el = target.el || null;
    const tgt = {
        el,
        root: target.root || null,
        tag: target.tag || (el ? el.tagName.toLowerCase() : null),
        id: target.id || (el ? (el.id || null) : null),
        classes: (target.classes && target.classes.length) ? target.classes : (el ? [...el.classList] : []),
        ancestors: target.ancestors || []
    };

    const rules = parsed.rules.map((r) => {
        const mi = matchInfo(r.selector, tgt);
        return { ...r, matched: mi.matched, matchReason: mi.reason, matchApprox: !!mi.approx };
    });

    const matched = rules.filter((r) => r.matched);
    const eliminated = rules.filter((r) => !r.matched);
    const importantMatched = matched.filter((r) => r.important);
    const normalMatched = matched.filter((r) => !r.important);

    const layer = importantMatched.length ? importantMatched : normalMatched;
    const rankedLayer = sortLayer(layer);
    const winner = rankedLayer[0] || null;
    const runnerUp = rankedLayer[1] || null;

    rules.forEach((r) => {
        r.fate = !r.matched ? 'eliminated' : (r === winner ? 'winner' : 'loser');
    });

    const rounds = [];
    let decidedAt = null;

    // R1 매칭 필터
    rounds.push({
        n: 1, id: 'match', title: '매칭 필터',
        status: 'done',
        body: eliminated.length
            ? `${rules.length}개 규칙 중 <b>${eliminated.length}개</b>가 대상과 안 맞아 탈락. ${matched.length}개 진출.`
            : `${matched.length}개 규칙이 모두 대상과 매칭됩니다. 탈락 없음.`,
        eliminated: eliminated.map((r) => ({ selector: r.selector, reason: r.matchReason }))
    });

    if (matched.length === 0) {
        return {
            parsed, rules, rounds, winner: null, runnerUp: null,
            decidedAt: null,
            verdict: '대상과 매칭되는 규칙이 없습니다. 대상 조건이나 셀렉터를 확인하세요.',
            diagnosisText: buildDiagnosisText(tgt, null, null, '매칭 규칙 없음'),
            myths: [], cheapest: null
        };
    }

    // R2 !important 층
    if (importantMatched.length === 0) {
        rounds.push({ n: 2, id: 'important', title: '!important 층 분리', status: 'skipped', body: '!important 선언이 없습니다 — 이 라운드 건너뜀.' });
    } else if (importantMatched.length === 1) {
        rounds.push({
            n: 2, id: 'important', title: '!important 층 분리', status: 'decider',
            body: `<code>${importantMatched[0].selector}</code> 에 !important 가 있어 별도 층으로 승격됩니다. 이 층에 경쟁자가 없으므로 <b>특이도와 무관하게</b> 최종 승자로 확정. — 여기서 승부 종료.`
        });
        decidedAt = 2;
    } else {
        rounds.push({
            n: 2, id: 'important', title: '!important 층 분리', status: 'done',
            body: `!important 규칙이 ${importantMatched.length}개 — 이들끼리 다음 라운드에서 특이도로 겨룹니다. !important 없는 규칙은 전부 이 아래.`
        });
    }

    // R3 특이도 자릿수 대결
    let duel = null;
    let duelA = null;
    let duelB = null;
    let duelContext = '';
    if (rankedLayer.length >= 2) {
        duelA = rankedLayer[0];
        duelB = rankedLayer[1];
        duelContext = importantMatched.length
            ? '!important 층 안에서 특이도 자릿수를 왼쪽부터 비교합니다.'
            : '특이도 네 자리(인라인·ID·클래스·태그)를 왼쪽부터 비교합니다.';
    } else if (importantMatched.length && normalMatched.length >= 2) {
        const rn = sortLayer(normalMatched);
        duelA = rn[0];
        duelB = rn[1];
        duelContext = '일반 층 순위 (승자는 이미 !important 로 확정 — !important 를 지우면 이 결과가 적용됩니다)';
    }

    if (duelA && duelB) {
        const dec = decidingIndex(duelA.spec, duelB.spec);
        const isDecider = decidedAt === null && rankedLayer.length >= 2 && dec !== -1;
        if (isDecider) decidedAt = 3;
        duel = {
            aName: duelA.selector, bName: duelB.selector,
            a: tupleArr(duelA.spec), b: tupleArr(duelB.spec),
            deciding: dec
        };
        rounds.push({
            n: 3, id: 'spec', title: '특이도 자릿수 대결',
            status: isDecider ? 'decider' : 'done',
            body: duelContext,
            duel
        });
    } else {
        rounds.push({ n: 3, id: 'spec', title: '특이도 자릿수 대결', status: 'skipped', body: '비교할 규칙이 2개 미만입니다.' });
    }

    // R4 소스 순서
    if (duelA && duelB && decidingIndex(duelA.spec, duelB.spec) === -1 && decidedAt === null) {
        decidedAt = 4;
        rounds.push({
            n: 4, id: 'order', title: '소스 순서', status: 'decider',
            body: `특이도가 (${tupleArr(duelA.spec).join(',')}) 로 완전히 같습니다. 이럴 때는 스타일시트에서 <b>나중에 선언된</b> <code>${winner.selector}</code> 가 이깁니다.`
        });
    } else {
        rounds.push({
            n: 4, id: 'order', title: '소스 순서', status: 'skipped',
            body: decidedAt && decidedAt < 4
                ? '앞 라운드에서 승자가 결정됨 — 사용하지 않습니다.'
                : '특이도 동점 상황이 아니라 소스 순서까지 가지 않았습니다.'
        });
    }

    const verdict = buildVerdict(winner, decidedAt, duel);
    const myths = detectMyths(winner, runnerUp, matched);
    const cheapest = cheapestWin(runnerUp, winner);
    const diagnosisText = buildDiagnosisText(tgt, winner, runnerUp, verdictReason(winner, decidedAt, duel), cheapest);

    return { parsed, rules, rounds, winner, runnerUp, decidedAt, verdict, diagnosisText, myths, cheapest };
}

function verdictReason(winner, decidedAt, duel) {
    if (!winner) return '매칭 규칙 없음';
    if (decidedAt === 2) return '!important 층 단독 → 특이도 비교 없이 승리';
    if (decidedAt === 3 && duel) return `특이도 ${COL_KR[duel.deciding]} 자리에서 ${duel.a[duel.deciding]} vs ${duel.b[duel.deciding]} 로 결정`;
    if (decidedAt === 4 && duel) return `특이도 동점 (${duel.a.join(',')}) → 소스 순서상 마지막`;
    return '유일하게 매칭된 규칙';
}

function buildVerdict(winner, decidedAt, duel) {
    if (!winner) return '대상과 매칭되는 규칙이 없습니다.';
    const base = `<code>${ruleText(winner)}</code> 이(가) 적용됩니다.`;
    if (decidedAt === 2) {
        return `${base} 특이도가 더 높은 규칙이 있어도 <b>!important 층</b>이 우선합니다.`;
    }
    if (decidedAt === 3 && duel) {
        return `${base} 특이도 네 자리를 왼쪽부터 비교해 <b>${COL_KR[duel.deciding]} 자리</b>에서 갈렸고, 오른쪽 자리는 읽지 않았습니다.`;
    }
    if (decidedAt === 4) {
        return `${base} 특이도가 같아 <b>소스 순서(나중 선언)</b>로 결정됐습니다. 순서를 바꾸면 결과도 바뀝니다.`;
    }
    return `${base} 대상에 매칭된 규칙이 이것 하나뿐입니다.`;
}

function buildDiagnosisText(tgt, winner, runnerUp, reason, cheapest) {
    const cls = tgt.classes.length ? ` class="${tgt.classes.join(' ')}"` : '';
    const id = tgt.id ? ` id="${tgt.id}"` : '';
    const lines = [
        '[특이도 진단서]',
        `대상: <${tgt.tag || 'element'}${id}${cls}>`,
        winner ? `적용: ${ruleText(winner)}` : '적용: 없음 (매칭 규칙 없음)',
        `사유: ${reason}`
    ];
    if (runnerUp) {
        lines.push(`차순위: ${runnerUp.selector}  (${tupleArr(runnerUp.spec).join(',')})`);
    }
    if (cheapest) {
        const good = cheapest.options.find((o) => o.kind === 'good');
        if (good) lines.push(`조언: ${cheapest.ruleLabel} 를 살리려면 — ${good.label}`);
    }
    return lines.join('\n');
}

export { tupleArr, decidingIndex, COL_KR };
