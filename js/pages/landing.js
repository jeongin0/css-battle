const FEATURES = [
    {
        href: '#battle',
        step: '01',
        title: '배틀',
        desc: '구조와 디자인 시안을 보고 CSS로 상대 규칙을 특이도로 이기며 시안을 재현합니다.'
    },
    {
        href: '#typing',
        step: '02',
        title: '타자연습',
        desc: 'DOM 구조를 보고 조건에 맞는 셀렉터를 직접 타이핑하며 반복 연습합니다.'
    },
    {
        href: '#diagnose',
        step: '03',
        title: '진단',
        desc: '실제 CSS 코드를 붙여넣고 어떤 규칙이 이기는지 우선순위를 진단합니다.'
    }
];

const AUDIENCE = [
    {
        icon: 'question',
        title: 'CSS만 만나면 멈추는 입문·주니어',
        desc: '선택자 우선순위가 감으로만 잡혀서, 스타일이 왜 안 먹히는지 설명하지 못하는 분'
    },
    {
        icon: 'clock',
        title: '실무에서 스타일 충돌에 시간 쓰는 현직자',
        desc: '어떤 규칙이 이기는지 찾느라 개발자도구를 한참 뒤지는 분'
    },
    {
        icon: 'robot',
        title: '막히면 바로 AI에 붙여넣는 분',
        desc: '되긴 하는데 원리는 여전히 모르는 채로 넘어가서, 다음에 또 똑같이 막히는 분'
    }
];

const SOLUTION = [
    {
        phase: '문제',
        text: 'CSS는 글로 배우면 추상적이라, !important로 땜빵하거나 충돌을 감으로 디버깅하게 됩니다.'
    },
    {
        phase: '방법',
        text: '대결로 결과를 눈으로 보고 → 손으로 직접 쳐보고 → 실전 코드에 적용하는 과정을 반복합니다.'
    },
    {
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
    return `<svg class="landing-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

export function render(container) {
    container.innerHTML = `
        <section class="container landing-hero">
            <p class="landing-hero-kicker">CSS BATTLE</p>
            <h1 class="landing-hero-headline">분명 스타일 줬는데, 왜 안 먹지?</h1>
            <p class="landing-hero-sub">CSS 특이도를 대결·타이핑·실전 진단으로 몸에 익히는 학습 도구</p>
            <a href="#battle" class="btn">지금 배틀 시작</a>
        </section>

        <section class="container landing-features">
            <h2 class="landing-section-title">3가지 모드</h2>
            <ol class="landing-features-list">
                ${FEATURES.map((f) => `
                    <li>
                        <a href="${f.href}" class="landing-feature-card">
                            <span class="landing-feature-step">${f.step}</span>
                            <span class="landing-feature-title">${f.title}</span>
                            <span class="landing-feature-desc">${f.desc}</span>
                            <span class="landing-feature-go">바로 가기 →</span>
                        </a>
                    </li>
                `).join('')}
            </ol>
        </section>

        <section class="container landing-audience">
            <h2 class="landing-section-title">이런 분께 추천</h2>
            <ul class="landing-audience-list">
                ${AUDIENCE.map((a) => `
                    <li class="landing-audience-item">
                        ${icon(a.icon)}
                        <h3 class="landing-audience-item-title">${a.title}</h3>
                        <p class="landing-audience-item-desc">${a.desc}</p>
                    </li>
                `).join('')}
            </ul>
        </section>

        <section class="container landing-solution">
            <h2 class="landing-section-title">어떻게 해결하나요</h2>
            <ol class="landing-solution-list">
                ${SOLUTION.map((s) => `
                    <li class="landing-solution-item">
                        <span class="landing-solution-phase">${s.phase}</span>
                        <p class="landing-solution-text">${s.text}</p>
                    </li>
                `).join('')}
            </ol>
        </section>
    `;
}
