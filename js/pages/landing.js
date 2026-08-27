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

const HOWTO = [
    {
        no: '1',
        phase: '문제',
        text: 'CSS는 글로 배우면 추상적이라, !important로 땜빵하거나 충돌을 감으로 디버깅하게 됩니다.'
    },
    {
        no: '2',
        phase: '방법',
        text: '대결로 결과를 눈으로 보고 → 손으로 직접 쳐보고 → 실전 코드에 적용하는 과정을 반복합니다.'
    },
    {
        no: '3',
        phase: '결과',
        text: 'CSS 충돌 원인을 스스로 진단하고, !important 의존도가 줄고, 캐스케이드 개념이 잡힙니다.'
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
            <h2 class="landing-heading"><span>SELECT</span> 3가지 모드</h2>
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
            <h2 class="landing-heading"><span>PLAYER</span> 이런 분이라면</h2>
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
            <ol class="landing-howto-list">
                ${HOWTO.map((h) => `
                    <li class="landing-howto-step">
                        <span class="landing-howto-no">${h.no}</span>
                        <span class="landing-howto-body">
                            <span class="landing-howto-phase">${h.phase}</span>
                            <span class="landing-howto-text">${h.text}</span>
                        </span>
                    </li>
                `).join('')}
            </ol>
            <a href="#battle" class="landing-hero-start landing-howto-start">▶ PRESS START</a>
        </section>
    `;
}
