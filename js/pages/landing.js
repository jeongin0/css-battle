import { getState, todayKey } from '../store.js';
import { dailyQuests, calculateStreak, perfectDays } from '../core/streak.js';

const MODES = [
    {
        href: '#typing',
        stage: 'STAGE 01',
        title: '타자연습',
        desc: '주어진 CSS 선택자를 그대로 빠르고 정확하게 타이핑하며, 그 선택자가 무엇을 고르는지 함께 익힙니다.',
        demo: `<span class="landing-demo-code"><b class="ok">.card</b> <b class="ok">&gt;</b> <b class="ok">.title</b> <b class="bad">+</b><span class="cur"></span></span>`
    },
    {
        href: '#diagnose',
        stage: 'STAGE 02',
        title: 'CSS 디버그',
        desc: '"스타일 줬는데 왜 안 먹히지?" 상황을 앱이 출제합니다. 원인을 고르고, !important 없이 최소 수정으로 직접 고칩니다.',
        demo: `<span class="landing-demo-mini is-bug">지금</span><span class="landing-demo-arrow">▶</span><span class="landing-demo-mini is-fix">수정 후</span>`
    },
    {
        href: '#battle',
        stage: 'STAGE 03',
        title: '배틀',
        desc: '완성된 디자인 시안을 보고 CSS를 0부터 작성해 똑같이 재현하는 모작 연습. 겹쳐보기와 예시 정답으로 확인합니다.',
        demo: `<span class="landing-demo-card"><span class="landing-demo-card-dot"></span><span class="landing-demo-card-bar"></span><span class="landing-demo-card-bar short"></span></span>`
    }
];

const COURSE = [
    { no: '1', href: '#typing', title: '타자연습으로 손 풀기', text: '가장 가벼운 시작. 선택자를 손에 익히면서 조합자·의사클래스·속성 선택자의 생김새를 눈에 익힙니다.' },
    { no: '2', href: '#diagnose', title: 'CSS 디버그로 원리 잡기', text: '충돌·버그 상황에서 "무엇이 이기나 / 왜 효과가 안 나나"를 고르고 직접 고쳐보며 캐스케이드를 이해합니다.' },
    { no: '3', href: '#battle', title: '배틀로 실전 재현', text: '시안을 CSS로 처음부터 재현. 앞서 익힌 선택자와 캐스케이드 감각을 결과물로 확인합니다.' }
];

const PLAYERS = [
    { tag: '1P', icon: 'question',
        title: 'CSS만 만나면 멈추는 입문·주니어',
        desc: '선택자 우선순위가 감으로만 잡혀서, 스타일이 왜 안 먹히는지 설명하지 못하는 분' },
    { tag: '2P', icon: 'clock',
        title: '실무에서 스타일 충돌에 시간 쓰는 현직자',
        desc: '어떤 규칙이 이기는지 찾느라 개발자도구를 한참 뒤지는 분' },
    { tag: '3P', icon: 'robot',
        title: '막히면 바로 AI에 붙여넣는 분',
        desc: '되긴 하는데 원리는 여전히 모르는 채로 넘어가서, 다음에 또 똑같이 막히는 분' }
];

const HOWTO_INTRO = [
    '같은 화면을 만드는 방법도 사람마다 다르고, 여러 CSS 규칙이 겹치면 어떤 스타일이 우선 적용되는지 찾아내는 데 시간이 걸립니다.<br>그래서 원하는 스타일이 적용되지 않을 때 하나씩 코드를 확인해보거나, 결국 !important를 붙여 강제로 해결하게 되기도 합니다.',
    '이 사이트는 이런 CSS 충돌을 감으로 해결하는 대신, 선택자와 캐스케이드를 눈으로 보고 → 손으로 치고 → 직접 고치며 익히도록 만들었습니다.'
];

const TRUST = ['무료', '회원가입 없음', '설치 없음', '기록은 이 브라우저에만 저장', '5분이면 첫 판', '최신 Chrome · Edge 권장'];

const ICONS = {
    question: '<path d="M8.5 8.5a3.5 3.5 0 0 1 6.8 1.2c0 2.3-3.3 2.8-3.3 5"/><path d="M12 19h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    robot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>'
};

function icon(name) {
    return `<svg class="landing-players-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

export function render(container) {
    const state = getState();
    const streak = calculateStreak(state.visitLog);
    const stamps = perfectDays(state.questLog);
    const quests = dailyQuests();
    const todayDone = new Set(state.questLog[todayKey()] || []);

    container.innerHTML = `
        <section class="landing-hero">
            <p class="landing-hero-coin">◆ INSERT COIN ◆</p>
            <h2 class="landing-hero-logo">CSS<br>BATTLE</h2>
            <p class="landing-hero-tagline">분명 스타일 줬는데, 왜 안 먹지?</p>
            <p class="landing-hero-sub">CSS 선택자와 캐스케이드를 타이핑·진단·재현으로 몸에 익히는 학습 도구</p>
            <span class="landing-hero-cta">
                <a href="#typing" class="landing-hero-start">▶ 처음이라면 타자연습</a>
            </span>
        </section>

        <div class="landing-retention">
            <span class="landing-retention-item"><img class="icon-px" src="img/icon_fire.png" alt=""> <b>${streak.current}일</b> 연속 접속</span>
            <span class="landing-retention-item"><img class="icon-px" src="img/icon_star.png" alt=""> 스탬프 <b>${stamps}</b>개</span>
            <span class="landing-retention-quests">
                오늘의 퀘스트
                ${quests.map((q) => `<span class="${todayDone.has(q.id) ? 'is-done' : ''}">${q.label}</span>`).join('')}
            </span>
            <a href="#quest" class="landing-retention-go">퀘스트 보기 ▶</a>
        </div>

        <section class="landing-modes">
            <h2 class="landing-heading"><span>MODE</span> STAGE SELECT</h2>
            <ol class="landing-modes-list">
                ${MODES.map((m) => `
                    <li>
                        <a href="${m.href}" class="landing-mode">
                            <span class="landing-mode-stage">${m.stage}</span>
                            <span class="landing-mode-title">${m.title}</span>
                            <span class="landing-mode-demo">${m.demo}</span>
                            <span class="landing-mode-desc">${m.desc}</span>
                            <span class="landing-mode-go">SELECT ▶</span>
                        </a>
                    </li>
                `).join('')}
            </ol>
        </section>

        <section class="landing-howto">
            <h2 class="landing-heading"><span>MANUAL</span> HOW TO PLAY</h2>
            <p class="landing-howto-tagline">CSS가 왜 안 먹히는지, 직접 부딪혀보세요.</p>

            <div class="landing-howto-intro">
                ${HOWTO_INTRO.map((p) => `<p>${p}</p>`).join('')}
            </div>

            <p class="landing-howto-coursehead">막막하면 이 순서로 하세요</p>
            <ol class="landing-howto-list">
                ${COURSE.map((s) => `
                    <li class="landing-howto-step">
                        <a href="${s.href}" class="landing-howto-steplink">
                            <span class="landing-howto-no">${s.no}</span>
                            <span class="landing-howto-body">
                                <span class="landing-howto-step-title">${s.title}</span>
                                <span class="landing-howto-text">${s.text}</span>
                            </span>
                        </a>
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
            </div>
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

        <div class="landing-trust">
            <ul class="landing-trust-list">
                ${TRUST.map((t) => `<li>${t}</li>`).join('')}
            </ul>
        </div>
    `;

    const intro = showIntro();
    return () => intro?.remove();
}

function introSeen() {
    try { return sessionStorage.getItem('landing-intro-seen') === '1'; } catch { return false; }
}

function markIntroSeen() {
    try { sessionStorage.setItem('landing-intro-seen', '1'); } catch { /* noop */ }
}

function showIntro() {
    if (introSeen()) return null;
    document.getElementById('landing-intro')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'landing-intro';
    overlay.className = 'landing-intro';
    overlay.innerHTML = `
        <div class="landing-intro-box" role="dialog" aria-modal="true" aria-label="사이트 소개">
            <div class="landing-intro-bar">
                <span class="landing-intro-tag">ABOUT</span>
                <button type="button" class="landing-intro-close" aria-label="닫기">✕</button>
            </div>
            <div class="landing-intro-body">
                <p class="landing-intro-wordmark" aria-hidden="true">CSS<br>BATTLE</p>
                <div class="landing-intro-text">
                    <p>CSS 선택자와 캐스케이드를 타이핑·디버그·재현으로 익히는 학습용 웹입니다.</p>
                    <p>프레임워크 없이 SPA로 구현했고, 반응형·접근성을 고려했습니다.</p>
                    <p>AI를 활용해 약 14시간(2공수)에 기획부터 구현까지 완료했습니다.</p>
                </div>
                <p class="landing-intro-thanks">감사합니다.</p>
                <dl class="landing-intro-credit">
                    <div><dt>NAME</dt><dd>박정인</dd></div>
                    <div><dt>CONTACT</dt><dd>010-6637-4423</dd></div>
                </dl>
            </div>
        </div>
    `;

    overlay.querySelector('.landing-intro-close')
        .addEventListener('click', () => { markIntroSeen(); overlay.remove(); });

    document.body.appendChild(overlay);
    return overlay;
}