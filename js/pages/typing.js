import { nextDrill } from '../core/typingDrills.js';
import { reportTypingAccuracy } from '../store.js';

// 타이핑할 때마다 칼을 휘두르는 8bit 검사
const FIGHTER_SVG = `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path class="typing-fighter-slash" d="M30 4 A22 22 0 0 1 46 32" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/>
        <rect x="16" y="36" width="6" height="9" rx="1" fill="var(--p2)"/>
        <rect x="26" y="36" width="6" height="9" rx="1" fill="var(--p2)"/>
        <rect x="14" y="19" width="20" height="18" rx="2" fill="var(--p1)"/>
        <rect x="17" y="7" width="14" height="13" rx="2" fill="var(--ink)"/>
        <rect x="18" y="12" width="12" height="3" fill="var(--p1)"/>
        <g class="typing-fighter-sword">
            <rect x="30" y="0" width="4" height="21" rx="2" fill="var(--gold)"/>
            <rect x="25" y="20" width="14" height="3" rx="1" fill="var(--ink-dim)"/>
            <rect x="31" y="23" width="2" height="6" fill="var(--ink-dim)"/>
        </g>
    </svg>`;

function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function renderTarget(target, typed) {
    let html = '';
    for (let i = 0; i < target.length; i++) {
        const ch = target[i] === ' ' ? '&nbsp;' : escapeHtml(target[i]);
        const cls = i < typed.length ? (typed[i] === target[i] ? ' is-ok' : ' is-bad') : '';
        html += `<span class="typing-char${cls}">${ch}</span>`;
    }
    if (typed.length > target.length) {
        html += `<span class="typing-char is-bad">${escapeHtml(typed.slice(target.length))}</span>`;
    }
    return html;
}

export function render(container) {
    let drill = nextDrill();
    let target = drill.text;
    let startedAt = 0;
    let keystrokes = 0;
    let correctKeystrokes = 0;
    let correctChars = 0;
    let combo = 0;
    let bestCombo = 0;
    let completed = 0;
    let hadErrorThisDrill = false;
    let lastLen = 0;
    let swingFlip = false;

    container.innerHTML = `
        <section class="container typing-page">
            <h2 class="page-title">타자연습 모드</h2>
            <p class="page-desc">화면의 CSS 선택자를 똑같이, 빠르고 정확하게 타이핑하고 Enter로 넘기세요. 아래 설명으로 그 선택자가 무엇을 고르는지도 같이 익힙니다.</p>

            <div class="typing-topbar">
                <dl class="typing-stats">
                    <div><dt>타 / 분</dt><dd data-role="wpm">0</dd></div>
                    <div><dt>정확도 %</dt><dd data-role="acc">100</dd></div>
                    <div><dt>콤보</dt><dd data-role="combo">0</dd></div>
                </dl>
                <div class="typing-fighter" data-role="fighter" aria-hidden="true">${FIGHTER_SVG}</div>
            </div>

            <pre class="typing-answer" data-role="target"></pre>
            <p class="typing-tip" data-role="tip"></p>

            <div class="typing-row">
                <input type="text" class="css-editor typing-input" data-role="input" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="여기에 그대로 입력">
                <button type="button" class="btn typing-enter" data-role="enter">Enter ↵</button>
            </div>

            <div class="typing-actions">
                <button type="button" class="btn btn-ghost" data-role="skip">다음 (건너뛰기)</button>
                <span class="hint-text" data-role="feedback"></span>
            </div>
        </section>
    `;

    const el = {
        target: container.querySelector('[data-role="target"]'),
        tip: container.querySelector('[data-role="tip"]'),
        input: container.querySelector('[data-role="input"]'),
        feedback: container.querySelector('[data-role="feedback"]'),
        wpm: container.querySelector('[data-role="wpm"]'),
        acc: container.querySelector('[data-role="acc"]'),
        combo: container.querySelector('[data-role="combo"]'),
        enter: container.querySelector('[data-role="enter"]'),
        skip: container.querySelector('[data-role="skip"]'),
        fighter: container.querySelector('[data-role="fighter"]')
    };

    function renderStats() {
        const minutes = startedAt ? (Date.now() - startedAt) / 60000 : 0;
        const liveChars = correctChars + [...el.input.value].filter((c, i) => c === target[i]).length;
        el.wpm.textContent = minutes > 0 ? Math.round(liveChars / minutes) : 0;
        el.acc.textContent = keystrokes > 0 ? Math.round((correctKeystrokes / keystrokes) * 100) : 100;
        el.combo.textContent = combo;
        el.fighter.classList.toggle('is-hot', combo >= 5);
    }

    // 글자를 새로 칠 때마다 칼 휘두르기 (틀리면 움찔)
    function swing(hit) {
        el.fighter.classList.remove('is-swing-a', 'is-swing-b', 'is-miss');
        void el.fighter.offsetWidth;
        if (!hit) {
            el.fighter.classList.add('is-miss');
            return;
        }
        el.fighter.classList.add(swingFlip ? 'is-swing-a' : 'is-swing-b');
        swingFlip = !swingFlip;
    }

    function loadDrill(resetCombo) {
        if (resetCombo) combo = 0;
        hadErrorThisDrill = false;
        lastLen = 0;
        drill = nextDrill();
        target = drill.text;
        el.input.value = '';
        el.target.innerHTML = renderTarget(target, '');
        el.tip.textContent = drill.tip || '';
        el.feedback.textContent = '';
        el.input.focus();
        renderStats();
    }

    function submit() {
        if (el.input.value !== target) {
            el.feedback.textContent = '아직 정확히 일치하지 않습니다.';
            el.input.classList.remove('is-shake');
            void el.input.offsetWidth;
            el.input.classList.add('is-shake');
            combo = 0;
            el.combo.textContent = 0;
            hadErrorThisDrill = true;
            return;
        }
        completed += 1;
        correctChars += target.length;
        if (!hadErrorThisDrill) {
            combo += 1;
            bestCombo = Math.max(bestCombo, combo);
        } else {
            combo = 0;
        }
        renderStats();
        reportTypingAccuracy(Number(el.acc.textContent));
        el.feedback.textContent = completed % 5 === 0 ? `정확해요! (${completed}문제 완료 · 최고 콤보 ${bestCombo})` : '정확해요!';
        loadDrill(false);
    }

    function onInput() {
        if (!startedAt) startedAt = Date.now();
        const typed = el.input.value;
        keystrokes += 1;
        const pos = typed.length - 1;
        const hit = pos >= 0 && typed[pos] === target[pos];
        if (hit) correctKeystrokes += 1;
        else if (pos >= 0) hadErrorThisDrill = true;
        if (typed.length > lastLen) swing(hit);
        lastLen = typed.length;
        el.target.innerHTML = renderTarget(target, typed);
        renderStats();
    }

    el.input.addEventListener('input', onInput);
    el.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    el.enter.addEventListener('click', submit);
    el.skip.addEventListener('click', () => loadDrill(true));

    loadDrill(false);
}
