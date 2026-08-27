// 5-4. 문제 자동 생성 로직 (타자연습 모드 · 배틀 모드 공용)

import { calculateSpecificity } from './specificity.js';

const TAG_POOL = ['div', 'section', 'article', 'span', 'p', 'h2', 'ul', 'li'];
const CLASS_POOL = ['card', 'title', 'active', 'btn', 'list', 'item', 'wrap', 'lead', 'box', 'main'];

const DEPTH_RANGE = {
    low: [1, 2],
    mid: [2, 3],
    high: [3, 4]
};

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickSome(arr, count) {
    const copy = [...arr];
    const out = [];
    while (out.length < count && copy.length) {
        out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
}

function randInt([min, max]) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// 난이도별 중첩 트리를 만들고, 각 노드에 클래스/ID를 부여한다.
export function generateDomSnippet(difficulty = 'low') {
    const maxDepth = randInt(DEPTH_RANGE[difficulty] || DEPTH_RANGE.low);
    const nodes = [];
    let idUsed = false;

    function buildNode(depth) {
        const tag = pick(TAG_POOL);
        const classCount = difficulty === 'low' ? randInt([0, 1]) : randInt([1, 2]);
        const classes = pickSome(CLASS_POOL, classCount);
        let id = null;
        if (!idUsed && difficulty !== 'low' && Math.random() < 0.4) {
            id = `n${nodes.length}`;
            idUsed = true;
        }
        const node = { tag, classes, id, depth, children: [] };
        nodes.push(node);

        if (depth < maxDepth) {
            const childCount = depth === 0 ? randInt([1, 2]) : randInt([0, 2]);
            for (let i = 0; i < childCount; i++) {
                node.children.push(buildNode(depth + 1));
            }
        }
        return node;
    }

    const root = buildNode(0);
    return { root, nodes, html: serialize(root, 0) };
}

export function serialize(node, indent, targetNode) {
    const pad = '  '.repeat(indent);
    const attrs = [
        node.id ? `id="${node.id}"` : '',
        node.classes.length ? `class="${node.classes.join(' ')}"` : '',
        node === targetNode ? 'data-target="1"' : ''
    ].filter(Boolean).join(' ');
    const open = `<${node.tag}${attrs ? ' ' + attrs : ''}>`;
    if (!node.children.length) {
        return `${pad}${open}</${node.tag}>`;
    }
    const inner = node.children.map((c) => serialize(c, indent + 1, targetNode)).join('\n');
    return `${pad}${open}\n${inner}\n${pad}</${node.tag}>`;
}

function nodePath(root, target) {
    const path = [];
    function walk(node) {
        path.push(node);
        if (node === target) return true;
        for (const child of node.children) {
            if (walk(child)) return true;
        }
        path.pop();
        return false;
    }
    walk(root);
    return path;
}

function segSelector(node) {
    if (node.id) return `#${node.id}`;
    if (node.classes.length) return '.' + node.classes.join('.');
    return node.tag;
}

// markedHtml을 실제로 파싱해, 대상만 유일하게 선택하는 셀렉터를 보장한다.
function uniqueAnswer(markedHtml, prettyAnswer) {
    const holder = document.createElement('div');
    holder.innerHTML = markedHtml;
    const target = holder.querySelector('[data-target="1"]');
    if (!target) return prettyAnswer;

    try {
        const hits = holder.querySelectorAll(prettyAnswer);
        if (hits.length === 1 && hits[0] === target) return prettyAnswer;
    } catch { /* fall through */ }

    const parts = [];
    let node = target;
    while (node && node !== holder) {
        const parent = node.parentElement;
        const idx = parent ? [...parent.children].indexOf(node) + 1 : 1;
        parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${idx})`);
        node = parent;
    }
    return parts.join(' > ');
}

// 난이도별 미션 조건 생성
export function generateProblem(difficulty = 'low') {
    const snippet = generateDomSnippet(difficulty);
    const candidates = snippet.nodes.filter((n) => n.classes.length || n.id);
    const target = (candidates.length ? pick(candidates) : pick(snippet.nodes));
    const path = nodePath(snippet.root, target);
    const markedHtml = serialize(snippet.root, 0, target);

    if (difficulty === 'low') {
        return {
            difficulty, domHtml: snippet.html, markedHtml, target, path,
            answer: uniqueAnswer(markedHtml, path.map(segSelector).join(' ')),
            mission: '표시된 엘리먼트 하나만 선택하는 셀렉터를 작성하세요.',
            check: { type: 'unique-match' }
        };
    }

    const classChain = path.filter((n) => n.classes.length).map((n) => '.' + n.classes[0]);

    if (difficulty === 'mid') {
        const answer = target.classes.length >= 2
            ? '.' + target.classes.slice(0, 2).join('.')
            : classChain.slice(-2).join(' ');
        return {
            difficulty, domHtml: snippet.html, markedHtml, target, path,
            answer: answer || `.${target.classes[0] || target.tag} ${target.tag}`,
            mission: '표시된 엘리먼트를 특이도 (0,0,2,0) 이상으로 선택하세요.',
            check: { type: 'min-specificity', minSpec: { inline: 0, id: 0, class: 2, tag: 0 } }
        };
    }

    const opponent = buildOpponentSelector(path);
    return {
        difficulty, domHtml: snippet.html, markedHtml, target, path,
        answer: (classChain.length >= 3 ? classChain : [target.tag, ...classChain]).join(' '),
        mission: `상대 셀렉터 "${opponent}" 를 특이도로 이기면서 표시된 엘리먼트를 선택하세요.`,
        check: { type: 'beat-selector', opponent, opponentSpec: calculateSpecificity(opponent) }
    };
}

function buildOpponentSelector(path) {
    return path
        .filter((n) => n.classes.length || n.tag)
        .slice(-2)
        .map((n) => (n.classes.length ? '.' + n.classes[0] : n.tag))
        .join(' ');
}

// 입력 셀렉터를 실제 DOM에 대해 검증 (브라우저 네이티브 엔진 → 100% 정확)
export function validateSelector(problem, userSelector) {
    const input = userSelector.trim();
    if (!input) return { valid: false, reason: '셀렉터를 입력하세요.' };

    const holder = document.createElement('div');
    holder.innerHTML = problem.markedHtml;
    const targetEl = holder.querySelector('[data-target="1"]');

    let matched;
    try {
        matched = [...holder.querySelectorAll(input)];
    } catch {
        return { valid: false, reason: '유효한 CSS 셀렉터가 아닙니다.' };
    }

    const hitsTarget = matched.includes(targetEl);
    const spec = calculateSpecificity(input);
    const check = problem.check;

    if (!hitsTarget) {
        return { valid: true, pass: false, spec, reason: '표시된 엘리먼트를 선택하지 못했습니다.' };
    }

    if (check.type === 'unique-match') {
        return matched.length === 1
            ? { valid: true, pass: true, spec, reason: '정확히 이 엘리먼트만 선택했습니다.' }
            : { valid: true, pass: false, spec, reason: `${matched.length}개가 선택됩니다. 하나만 선택해야 합니다.` };
    }

    if (check.type === 'min-specificity') {
        const ok = compareSpec(spec, check.minSpec) >= 0;
        return { valid: true, pass: ok, spec, reason: ok ? '조건 특이도를 만족합니다.' : '특이도가 조건보다 낮습니다.' };
    }

    const ok = compareSpec(spec, check.opponentSpec) > 0;
    return { valid: true, pass: ok, spec, reason: ok ? '상대 셀렉터를 특이도로 이겼습니다.' : '상대 셀렉터를 이기지 못했습니다.' };
}

function compareSpec(a, b) {
    if (a.id !== b.id) return a.id - b.id;
    if (a.class !== b.class) return a.class - b.class;
    return a.tag - b.tag;
}

// 적응형 난이도: 최근 N문제 정답률로 난이도 조정
export function adaptDifficulty(current, recentResults, windowSize = 5) {
    const window = recentResults.slice(-windowSize);
    if (window.length < windowSize) return current;
    const rate = window.filter(Boolean).length / window.length;
    const order = ['low', 'mid', 'high'];
    const idx = order.indexOf(current);
    if (rate >= 0.8 && idx < 2) return order[idx + 1];
    if (rate <= 0.4 && idx > 0) return order[idx - 1];
    return current;
}
