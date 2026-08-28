// 5-2. CSS 디버그 문제 풀
// type: 'cascade'  → "여러 규칙 중 어느 게 이기나 + 왜" (명시도/!important/소스 순서)
// type: 'behavior' → "속성은 적용됐는데 효과가 안 나는" (쌓임 맥락, 컨테이닝 블록, overflow 클리핑, 마진 상쇄, % 높이, object-fit)

export const REASONS = [
    { id: 'specificity', label: '명시도(2단계) 자리 비교에서 앞선다' },
    { id: 'important', label: '!important 라서 (1단계, 별도 층)' },
    { id: 'source-order', label: '명시도가 같아서, 스타일시트 뒤쪽에 있어서' },
    { id: 'more-classes', label: '선택자에 클래스를 더 많이 써서' }
];

export const FIX_KIND = {
    best: { score: 2, tag: '정답', tone: 'good' },
    works: { score: 1, tag: '동작하지만 과함', tone: 'warn' },
    important: { score: 1, tag: '!important — 감점', tone: 'warn' },
    nope: { score: 0, tag: '안 고쳐짐', tone: 'bad' }
};

const CASCADE = [
    {
        id: 'hero-classes', type: 'cascade', concept: 'specificity',
        symptom: '히어로 박스 글자가 남색이어야 하는데 진홍색으로 나옵니다.',
        html: `<div id="hero" class="box tall wide dark round">
    히어로 영역
</div>`,
        target: '#hero', prop: 'color',
        wrong: '진홍(crimson)', right: '남색(navy)', wrongProbe: 'crimson', rightProbe: 'navy',
        rules: [
            { sel: '.box.tall.wide.dark.round', decl: 'color: navy' },
            { sel: '#hero', decl: 'color: crimson' }
        ],
        answerWinner: 1, answerReason: 'specificity',
        fixes: [
            { label: '.box.tall.wide.dark.round 를 #hero.box.tall.wide.dark.round 로 바꾼다', kind: 'best', op: { op: 'selector', ruleIdx: 0, value: '#hero.box.tall.wide.dark.round' } },
            { label: 'navy 선언에 !important 를 붙인다', kind: 'important', op: { op: 'important', ruleIdx: 0 } },
            { label: '.box.tall.wide.dark.round 를 #hero#hero 로 바꾼다', kind: 'works', op: { op: 'selector', ruleIdx: 0, value: '#hero#hero' } },
            { label: '.box.tall.wide.dark.round 앞에 body 를 붙인다', kind: 'nope', op: { op: 'prefix', ruleIdx: 0, value: 'body ' } }
        ]
    },
    {
        id: 'post-important', type: 'cascade', concept: 'specificity',
        symptom: '본문 문단이 검정이어야 하는데 옅은 회색으로 나옵니다.',
        html: `<article class="post">
    <p class="body">문단 텍스트입니다.</p>
</article>`,
        target: 'p.body', prop: 'color',
        wrong: '옅은 회색(#999)', right: '검정(black)', wrongProbe: '#999', rightProbe: 'black',
        rules: [
            { sel: '.post .body', decl: 'color: black' },
            { sel: 'p', decl: 'color: #999 !important' }
        ],
        answerWinner: 1, answerReason: 'important',
        fixes: [
            { label: 'p 규칙에서 !important 를 제거한다', kind: 'best', op: { op: 'drop-important', ruleIdx: 1 } },
            { label: '.post .body 에도 !important 를 붙인다', kind: 'works', op: { op: 'important', ruleIdx: 0 } },
            { label: '.post .body 를 #main .post .body 로 바꾼다', kind: 'nope', op: { op: 'prefix', ruleIdx: 0, value: '#main ' } }
        ]
    },
    {
        id: 'banner-order', type: 'cascade', concept: 'specificity',
        symptom: '경고 배너 문구가 흰색이어야 하는데 짙은 회색으로 나옵니다.',
        html: `<div class="banner alert">
    <p class="banner-text">저장되지 않았습니다</p>
</div>`,
        target: 'p.banner-text', prop: 'color',
        wrong: '짙은 회색(#333)', right: '흰색(white)', wrongProbe: '#333', rightProbe: 'white',
        rules: [
            { sel: '.alert .banner-text', decl: 'color: white' },
            { sel: '.banner .banner-text', decl: 'color: #333' }
        ],
        answerWinner: 1, answerReason: 'source-order',
        fixes: [
            { label: 'white 규칙을 스타일시트 맨 아래로 옮긴다', kind: 'best', op: { op: 'move-last', ruleIdx: 0 } },
            { label: '.alert .banner-text 를 .banner.alert .banner-text 로 바꾼다', kind: 'works', op: { op: 'selector', ruleIdx: 0, value: '.banner.alert .banner-text' } },
            { label: '.alert .banner-text 에 !important 를 붙인다', kind: 'important', op: { op: 'important', ruleIdx: 0 } },
            { label: 'white 규칙을 스타일시트 맨 위로 옮긴다', kind: 'nope', op: { op: 'move-first', ruleIdx: 0 } }
        ]
    }
];

const IMG_240x80 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='80'%3E%3Crect width='240' height='80' fill='%23ff9800'/%3E%3C/svg%3E";

const BEHAVIOR = [
    {
        id: 'stacking-context', type: 'behavior', concept: 'stacking-context',
        symptom: '빨간 배지에 z-index: 999 를 줬는데도 옆 파란 패널 뒤로 가려집니다.',
        html: `<div class="row">
    <div class="card"><span class="badge">NEW</span></div>
    <div class="panel">패널</div>
</div>`,
        target: '.badge',
        rules: [
            { sel: '.row', decl: 'display: flex; align-items: flex-start; padding: 16px' },
            { sel: '.card', decl: 'position: relative; transform: translateZ(0); width: 90px; height: 54px; background: #dddddd' },
            { sel: '.badge', decl: 'position: absolute; right: -26px; top: 14px; z-index: 999; background: crimson; color: #fff; padding: 3px 7px; font-size: 12px' },
            { sel: '.panel', decl: 'position: relative; z-index: 1; width: 120px; height: 54px; background: #7db8ff; margin-left: -18px' }
        ],
        causes: [
            { text: '.badge 의 z-index: 999 가 실제로는 더 낮게 계산된다', correct: false },
            { text: '부모 .card 의 transform 이 새 쌓임 맥락을 만들어서, 999 는 그 안에서만 유효하다', correct: true },
            { text: '.panel 이 CSS 에서 나중에 선언돼서 이긴다', correct: false },
            { text: 'position: absolute 요소는 z-index 가 무시된다', correct: false }
        ],
        fixes: [
            { label: '.card 에서 transform 을 제거한다', kind: 'best', op: { op: 'remove-decl', ruleIdx: 1, prop: 'transform' } },
            { label: '.card 자체에 z-index: 2 를 준다', kind: 'works', op: { op: 'add-decl', ruleIdx: 1, decl: 'z-index: 2' } },
            { label: '.badge 의 z-index 를 99999 로 올린다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 2, prop: 'z-index', value: '99999' } },
            { label: '.badge 에 z-index: 999 !important 를 준다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 2, prop: 'z-index', value: '999 !important' } }
        ],
        verify: { kind: 'onTop', overlapWith: '.panel' },
        teach: {
            cause: '요소에 <code>transform</code> · <code>opacity</code>(1 미만) · <code>filter</code> 등이 붙으면 그 요소가 <b>새 쌓임 맥락</b>이 됩니다. 자식의 <code>z-index</code> 는 아무리 커도 <b>그 맥락 안에서만</b> 순위를 매기고, 바깥의 <code>.panel</code> 과는 <code>.card</code> 자체의 순위로 겨룹니다. <code>.card</code> 는 z-index 가 없어서(auto) <code>.panel</code>(z-index: 1) 에 밀립니다.',
            fix: '<code>.card</code> 의 <code>transform</code> 을 지우면 맥락이 안 생겨서 <code>.badge</code> 가 문서 최상위에서 999 로 경쟁합니다. 또는 <code>.card</code> 자체에 <code>z-index: 2</code> 를 줘서 맥락째로 <code>.panel</code> 위로 올릴 수도 있습니다.'
        }
    },
    {
        id: 'containing-block', type: 'behavior', concept: 'containing-block',
        symptom: '카드 오른쪽 위에 닫기 버튼(×)을 붙이려고 position: absolute; top: 8px; right: 8px 를 줬는데, 카드가 아니라 화면 구석에 가 있습니다.',
        html: `<div class="wrap">
    <div class="modal">
        <button class="close">×</button>
        <p>알림 내용</p>
    </div>
</div>`,
        target: '.close',
        rules: [
            { sel: '.wrap', decl: 'padding: 28px' },
            { sel: '.modal', decl: 'width: 150px; background: #eef1ff; padding: 16px' },
            { sel: '.close', decl: 'position: absolute; top: 8px; right: 8px; width: 20px; height: 20px' }
        ],
        causes: [
            { text: '.close 의 top / right 값이 잘못됐다', correct: false },
            { text: '.modal 에 position 이 없어서, .close 의 기준(컨테이닝 블록)이 위로 거슬러 올라가 뷰포트가 된다', correct: true },
            { text: 'position: absolute 는 언제나 화면 기준이다', correct: false },
            { text: '.wrap 의 padding 때문에 밀렸다', correct: false }
        ],
        fixes: [
            { label: '.modal 에 position: relative 를 추가한다', kind: 'best', op: { op: 'add-decl', ruleIdx: 1, decl: 'position: relative' } },
            { label: '.modal 에 position: absolute 를 추가한다', kind: 'works', op: { op: 'add-decl', ruleIdx: 1, decl: 'position: absolute' } },
            { label: '.close 의 position 을 static 으로 바꾼다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 2, prop: 'position', value: 'static' } },
            { label: '.close 의 top / right 를 !important 로 강제한다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 2, prop: 'top', value: '8px !important' } }
        ],
        verify: { kind: 'insideParent', parent: '.modal' },
        teach: {
            cause: '<code>position: absolute</code> 요소의 기준(컨테이닝 블록)은 <b>가장 가까운 "위치가 지정된" 조상</b>입니다. <code>.modal</code> 에 <code>position</code> 이 없으면 그 조상, 또 없으면 계속 위로 올라가 결국 <b>뷰포트</b>가 기준이 됩니다.',
            fix: '<code>.modal</code> 에 <code>position: relative</code> 만 주면 됩니다 — <code>.modal</code> 이 기준이 되면서 레이아웃은 그대로입니다. <code>absolute</code> 를 주면 되지만 <code>.modal</code> 이 문서 흐름에서 빠집니다.'
        }
    },
    {
        id: 'overflow-clip', type: 'behavior', concept: 'overflow-clip',
        symptom: '메뉴 버튼 아래로 나와야 할 드롭다운(.menu)이, 카드 경계에서 잘려 안 보입니다.',
        html: `<div class="tool">
    <button class="btn">메뉴 ▾</button>
    <ul class="menu"><li>항목 1</li><li>항목 2</li></ul>
</div>`,
        target: '.menu',
        rules: [
            { sel: '.tool', decl: 'position: relative; width: 130px; border: 1px solid #cccccc; border-radius: 8px; overflow: hidden; padding: 8px' },
            { sel: '.btn', decl: 'display: block; width: 100%' },
            { sel: '.menu', decl: 'position: absolute; top: 100%; left: 8px; width: 120px; background: #ffffff; border: 1px solid #cccccc; list-style: none; margin: 0; padding: 4px' }
        ],
        causes: [
            { text: '.menu 의 top: 100% 가 잘못됐다', correct: false },
            { text: '라운드 처리하려고 .tool 에 준 overflow: hidden 이, absolute 로 띄운 자식(.menu)까지 잘라낸다', correct: true },
            { text: '.menu 의 z-index 가 없어서 안 보인다', correct: false },
            { text: 'position: absolute 요소는 부모 밖으로 못 나간다', correct: false }
        ],
        fixes: [
            { label: '.tool 의 overflow 를 visible 로 되돌린다 (라운드는 안쪽 래퍼에서)', kind: 'best', op: { op: 'replace-decl', ruleIdx: 0, prop: 'overflow', value: 'visible' } },
            { label: '.menu 의 position 을 static 으로 바꿔 흐름에 태운다', kind: 'works', op: { op: 'replace-decl', ruleIdx: 2, prop: 'position', value: 'static' } },
            { label: '.menu 의 top 을 0 으로 바꾼다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 2, prop: 'top', value: '0' } },
            { label: '.menu 에 z-index: 9999 !important 를 준다', kind: 'nope', op: { op: 'add-decl', ruleIdx: 2, decl: 'z-index: 9999 !important' } }
        ],
        verify: { kind: 'notClipped', below: '.btn' },
        teach: {
            cause: '<code>overflow: hidden</code>(또는 <code>auto</code>·<code>scroll</code>·<code>clip</code>)은 그 박스를 넘어가는 <b>모든 자손</b>을 자릅니다 — <code>position: absolute</code> 로 띄운 자식도 예외가 아닙니다. 라운드 모서리를 만들려고 부모에 준 <code>overflow: hidden</code> 이 드롭다운을 삼킨 것입니다.',
            fix: '가장 깔끔한 건 그 자리에서 <code>overflow: hidden</code> 을 빼는 것입니다(라운드는 잘려야 할 실제 콘텐츠에만 적용). 드롭다운을 흐름 요소로 바꾸면 잘리진 않지만 아래 레이아웃을 밀어냅니다.'
        }
    },
    {
        id: 'margin-collapse', type: 'behavior', concept: 'margin-collapse',
        symptom: '.inner 에 margin-top: 32px 를 줬는데, .inner 가 .box 안에서 안 내려가고 .box 전체가 아래로 밀립니다.',
        html: `<div class="page">
    <div class="box"><p class="inner">본문</p></div>
</div>`,
        target: '.inner',
        rules: [
            { sel: '.page', decl: 'padding-top: 4px' },
            { sel: '.box', decl: 'background: #eef1ff' },
            { sel: '.inner', decl: 'margin: 32px 0 0' }
        ],
        causes: [
            { text: '.inner 의 margin 이 무시되고 있다', correct: false },
            { text: '부모(.box)와 첫 자식(.inner)의 위쪽 마진이 하나로 합쳐진다(마진 상쇄) — 그래서 .box 째로 내려간다', correct: true },
            { text: '.box 에 height 가 없어서', correct: false },
            { text: 'p 태그의 기본 margin 때문에', correct: false }
        ],
        fixes: [
            { label: '.box 에 display: flow-root 를 준다', kind: 'best', op: { op: 'add-decl', ruleIdx: 1, decl: 'display: flow-root' } },
            { label: '.box 에 overflow: hidden 을 준다', kind: 'works', op: { op: 'add-decl', ruleIdx: 1, decl: 'overflow: hidden' } },
            { label: '.inner 의 margin-top 을 64px 로 더 키운다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 2, prop: 'margin', value: '64px 0 0' } },
            { label: '.inner 의 margin 에 !important 를 붙인다', kind: 'nope', op: { op: 'important', ruleIdx: 2 } }
        ],
        verify: { kind: 'gap', parent: '.box', min: 20 },
        teach: {
            cause: '부모와 그 <b>첫 자식</b> 사이에 테두리·패딩·인라인 콘텐츠가 없으면, 둘의 위쪽 마진이 <b>하나로 합쳐집니다</b>(마진 상쇄). 그래서 자식 안에서 내려가는 대신 부모째로 32px 내려간 것입니다.',
            fix: '<code>.box</code> 에 <code>display: flow-root</code> 를 주면 새 블록 서식 문맥이 생겨 상쇄가 막힙니다(부작용 없음). <code>overflow: hidden</code> · <code>padding-top: 1px</code> · <code>border-top</code> 도 되지만 각각 side effect 가 있습니다.'
        }
    },
    {
        id: 'percent-height', type: 'behavior', concept: 'percent-height',
        symptom: '.fill 에 height: 100% 를 줬는데 높이가 0 이라 하늘색 배경이 안 보입니다.',
        html: `<div class="frame">
    <div class="fill">내용</div>
</div>`,
        target: '.fill',
        rules: [
            { sel: '.frame', decl: 'width: 170px; border: 1px solid #cccccc' },
            { sel: '.fill', decl: 'height: 100%; background: #bfe3ff' }
        ],
        causes: [
            { text: 'background 색이 잘못 지정됐다', correct: false },
            { text: '퍼센트 높이는 부모의 높이가 정해져 있어야 계산된다 — .frame 에 height 가 없어서 100% 가 0 이 된다', correct: true },
            { text: '.fill 에 width 가 없어서', correct: false },
            { text: 'height: 100% 대신 100vh 를 써야 한다', correct: false }
        ],
        fixes: [
            { label: '.frame 에 height 를 지정한다 (예: 120px)', kind: 'best', op: { op: 'add-decl', ruleIdx: 0, decl: 'height: 120px' } },
            { label: '.frame 에 aspect-ratio: 2 / 1 을 준다 (너비로 높이가 정해짐)', kind: 'works', op: { op: 'add-decl', ruleIdx: 0, decl: 'aspect-ratio: 2 / 1' } },
            { label: '.fill 의 height 를 100vh 로 바꾼다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 1, prop: 'height', value: '100vh' } },
            { label: '.fill 의 height 에 !important 를 붙인다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 1, prop: 'height', value: '100% !important' } }
        ],
        verify: { kind: 'hasHeight', min: 60, max: 260 },
        teach: {
            cause: '<code>height</code>·<code>top</code> 등의 <b>퍼센트 값</b>은 부모의 그 값을 기준으로 계산합니다. 부모(<code>.frame</code>)의 높이가 콘텐츠에 따라 정해지는 <code>auto</code> 상태면, "부모 높이의 100%"는 계산할 게 없어서 <code>0</code> 이 됩니다.',
            fix: '<code>.frame</code> 에 <code>height</code>(또는 <code>min-height</code>)를 명시하거나, <code>.frame</code> 을 flex/grid 컨테이너로 만들어 자식이 늘어나게 합니다.'
        }
    },
    {
        id: 'object-fit', type: 'behavior', concept: 'object-fit',
        symptom: '섬네일 이미지에 object-fit: cover 를 줬는데, 100×100 으로 안 잘리고 원본 비율(가로로 긴) 그대로입니다.',
        html: `<figure class="thumb">
    <img src="${IMG_240x80}" alt="">
</figure>`,
        target: '.thumb img',
        rules: [
            { sel: '.thumb', decl: 'width: 100px; height: 100px; margin: 0' },
            { sel: '.thumb img', decl: 'object-fit: cover' }
        ],
        causes: [
            { text: 'object-fit 값이 cover 가 아니라 contain 이어야 한다', correct: false },
            { text: 'object-fit 은 이미지에 width/height(또는 aspect-ratio)가 지정돼 있어야 동작한다 — 지금은 원본 크기 그대로라 맞출 상자가 없다', correct: true },
            { text: '.thumb 에 overflow: hidden 이 없어서', correct: false },
            { text: 'img 대신 background-image 를 써야 한다', correct: false }
        ],
        fixes: [
            { label: '.thumb img 에 width: 100%; height: 100% 를 준다', kind: 'best', op: { op: 'add-decl', ruleIdx: 1, decl: 'width: 100%; height: 100%' } },
            { label: '.thumb img 에 width: 100px; height: 100px 를 직접 준다', kind: 'works', op: { op: 'add-decl', ruleIdx: 1, decl: 'width: 100px; height: 100px' } },
            { label: '.thumb 에 overflow: hidden 을 준다', kind: 'nope', op: { op: 'add-decl', ruleIdx: 0, decl: 'overflow: hidden' } },
            { label: '.thumb img 에 object-fit: cover !important 를 준다', kind: 'nope', op: { op: 'replace-decl', ruleIdx: 1, prop: 'object-fit', value: 'cover !important' } }
        ],
        verify: { kind: 'boxSize', w: 100, h: 100, tol: 6 },
        teach: {
            cause: '<code>object-fit</code> 은 "이미지가 <b>주어진 상자</b> 안에서 어떻게 맞춰질지"를 정합니다. 이미지에 <code>width</code>/<code>height</code>(또는 <code>aspect-ratio</code>)가 없으면 상자 자체가 원본 크기라, 자르거나 늘릴 대상이 없습니다.',
            fix: '<code>img</code> 에 <code>width</code>·<code>height</code>(부모를 채우려면 <code>100%</code>)를 주면, 그 상자에 맞춰 <code>object-fit: cover</code> 가 동작합니다.'
        }
    }
];

const POOL = [...CASCADE, ...BEHAVIOR];

let lastId = null;
let bag = [];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function nextChallenge() {
    if (bag.length === 0) {
        bag = shuffle(POOL.map((_, i) => i));
        if (bag.length > 1 && POOL[bag[0]].id === lastId) {
            [bag[0], bag[1]] = [bag[1], bag[0]];
        }
    }
    const c = POOL[bag.shift()];
    lastId = c.id;
    return c;
}

export function buildCss(rules) {
    return rules.map((r) => (r.decl ? `${r.sel} { ${r.decl}; }` : `${r.sel} {}`)).join('\n');
}

function editDeclString(decl, prop, value) {
    const parts = decl.split(';').map((s) => s.trim()).filter(Boolean);
    const kept = parts.filter((p) => {
        const k = p.slice(0, p.indexOf(':')).trim().toLowerCase();
        return k !== prop.toLowerCase();
    });
    if (value != null) kept.push(`${prop}: ${value}`);
    return kept.join('; ');
}

export function applyFix(rules, t) {
    const next = rules.map((r) => ({ ...r }));
    const R = next[t.ruleIdx];
    switch (t.op) {
        case 'selector': R.sel = t.value; break;
        case 'prefix': R.sel = t.value + R.sel; break;
        case 'important': R.decl = `${R.decl} !important`; break;
        case 'drop-important': R.decl = R.decl.replace(/\s*!important/gi, ''); break;
        case 'move-last': { const [m] = next.splice(t.ruleIdx, 1); next.push(m); break; }
        case 'move-first': { const [m] = next.splice(t.ruleIdx, 1); next.unshift(m); break; }
        case 'add-decl': R.decl = R.decl ? `${R.decl}; ${t.decl}` : t.decl; break;
        case 'remove-decl': R.decl = editDeclString(R.decl, t.prop, null); break;
        case 'replace-decl': R.decl = editDeclString(R.decl, t.prop, t.value); break;
        default: break;
    }
    return next;
}
