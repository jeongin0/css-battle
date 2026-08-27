const MODES = [
    {
        href: '#battle',
        stage: 'STAGE 01',
        title: '배틀',
        desc: '구조와 디자인 시안을 보고 CSS로 상대 규칙을 특이도로 이기며 시안을 재현합니다.'
    },
    {
        href: '#typing',
        stage: 'STAGE 02',
        title: '타자연습',
        desc: 'DOM 구조를 보고 조건에 맞는 셀렉터를 직접 타이핑하며 반복 연습합니다.'
    },
    {
        href: '#diagnose',
        stage: 'STAGE 03',
        title: '진단',
        desc: '실제 CSS 코드를 붙여넣고 어떤 규칙이 이기는지 우선순위를 진단합니다.'
    }
];

const PLAYERS = [
    {
        tag: '1P',
        icon: 'question',
        title: 'CSS만 만나면 멈추는 입문·주니어',
        desc: '선택자 우선순위가 감으로만 잡혀서, 스타일이 왜 안 먹히는지 설명하지 못하는 분'
    },
    {
        tag: '2P',
        icon: 'clock',
        title: '실무에서 스타일 충돌에 시간 쓰는 현직자',
        desc: '어떤 규칙이 이기는지 찾느라 개발자도구를 한참 뒤지는 분'
    },
    {
        tag: '3P',
        icon: 'robot',
        title: '막히면 바로 AI에 붙여넣는 분',
        desc: '되긴 하는데 원리는 여전히 모르는 채로 넘어가서, 다음에 또 똑같이 막히는 분'
    }
];

const HOWTO_INTRO = [
    '같은 화면을 만드는 방법도 사람마다 다르고, 여러 CSS 규칙이 겹치면 어떤 스타일이 우선 적용되는지 찾아내는 데 시간이 걸립니다.<br>그래서 원하는 스타일이 적용되지 않을 때 하나씩 코드를 확인해보거나, 결국 !important를 붙여 강제로 해결하게 되기도 합니다.',
    '이 사이트는 이런 CSS 충돌을 감으로 해결하는 대신, specificity의 우선순위를 직접 경험하며 익히도록 만들었습니다.'
];

const HOWTO_STEPS = [
    {
        no: '1',
        title: '눈으로 비교하고',
        text: 'CSS 규칙이 충돌했을 때 어떤 스타일이 적용되는지 직접 결과를 비교하면서 CSS 우선순위의 차이를 자연스럽게 이해합니다.'
    },
    {
        no: '2',
        title: '손으로 직접 입력하고',
        text: '정답을 보는 것에서 끝나지 않습니다. 직접 CSS를 타이핑하고 적용해보며 specificity 규칙을 반복해서 익힙니다.'
    },
    {
        no: '3',
        title: '실전에서 진단하기',
        text: '마지막에는 실제 CSS처럼 충돌하는 스타일의 원인을 직접 찾아봅니다. 어떤 선택자가 더 높은 우선순위를 가지는지 판단하면서, CSS를 수정하는 감각을 기릅니다.'
    }
];

const ICONS = {
    question: '<path d="M8.5 8.5a3.5 3.5 0 0 1 6.8 1.2c0 2.3-3.3 2.8-3.3 5"/><path d="M12 19h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    robot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>'
};

function icon(name) {
    return `<svg class="landing-players-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

export function render(container) {
    container.innerHTML = `
        <section class="landing-hero">
            <p class="landing-hero-coin">◆ INSERT COIN ◆</p>
            <h1 class="landing-hero-logo">CSS<br>BATTLE</h1>
            <p class="landing-hero-tagline">분명 스타일 줬는데, 왜 안 먹지?</p>
            <p class="landing-hero-sub">CSS 특이도를 대결·타이핑·실전 진단으로 몸에 익히는 학습 도구</p>
            <a href="#battle" class="landing-hero-start">▶ PRESS START</a>
        </section>

        <section class="landing-modes">
            <h2 class="landing-heading"><span>MODE</span> STAGE SELECT</h2>
            <ol class="landing-modes-list">
                ${MODES.map((m) => `
                    <li>
                        <a href="${m.href}" class="landing-mode">
                            <span class="landing-mode-stage">${m.stage}</span>
                            <span class="landing-mode-title">${m.title}</span>
                            <span class="landing-mode-desc">${m.desc}</span>
                            <span class="landing-mode-go">SELECT ▶</span>
                        </a>
                    </li>
                `).join('')}
            </ol>
        </section>

        <section class="landing-players">
            <h2 class="landing-heading"><span>YOU</span> PLAYER SELECT</h2>
            <ul class="landing-players-list">
                ${PLAYERS.map((p) => `
                    <li class="landing-players-row">
                        <span class="landing-players-tag">${p.tag}</span>
                        <span class="landing-players-badge">${icon(p.icon)}</span>
                        <span class="landing-players-body">
                            <span class="landing-players-title">${p.title}</span>
                            <span class="landing-players-desc">${p.desc}</span>
                        </span>
                    </li>
                `).join('')}
            </ul>
        </section>

        <section class="landing-howto">
            <h2 class="landing-heading"><span>MANUAL</span> HOW TO PLAY</h2>
            <p class="landing-howto-tagline">CSS가 왜 안 먹히는지, 직접 부딪혀보세요.</p>

            <div class="landing-howto-intro">
                ${HOWTO_INTRO.map((p) => `<p>${p}</p>`).join('')}
            </div>

            <ol class="landing-howto-list">
                ${HOWTO_STEPS.map((s) => `
                    <li class="landing-howto-step">
                        <span class="landing-howto-no">${s.no}</span>
                        <span class="landing-howto-body">
                            <span class="landing-howto-step-title">${s.title}</span>
                            <span class="landing-howto-text">${s.text}</span>
                        </span>
                    </li>
                `).join('')}
            </ol>

            <div class="landing-howto-outcome">
                <h3 class="landing-howto-outcome-title">그래서 무엇이 달라질까요?</h3>
                <p>CSS가 적용되지 않을 때 무작정 코드를 수정하거나 !important를 사용하는 대신,</p>
                <p class="landing-howto-flow">
                    <span>왜 이 스타일이 적용되지 않았지?</span>
                    <span class="landing-howto-arrow">▶</span>
                    <span>어떤 규칙이 우선순위가 높지?</span>
                </p>
                <p>스스로 원인을 찾아낼 수 있게 됩니다.</p>
                <p class="landing-howto-closing">눈으로 보고 → 직접 입력하고 → 문제를 진단하는 과정을 반복하며, CSS specificity와 Cascade를 머리가 아니라 손에 익히는 것.</p>
                <p class="landing-howto-closing">이것이 이 사이트가 만들어진 이유입니다.</p>
            </div>

            <a href="#battle" class="landing-hero-start landing-howto-start">▶ PRESS START</a>
        </section>
    `;
}
