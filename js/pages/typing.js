import { nextDrill } from '../core/typingDrills.js';
import { addTypingRecord } from '../store.js';

function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function renderTarget(target, typed) {
    let html = '';
    for (let i = 0; i < target.length; i++) {
        const ch = target[i] === ' ' ? '&nbsp;' : escapeHtml(target[i]);
        let cls = 'is-pending';
        if (i < typed.length) cls = typed[i] === target[i] ? 'is-ok' : 'is-bad';
        else if (i === typed.length) cls = 'is-cursor';
        html += `<span class="typing-char ${cls}">${ch}</span>`;
    }
    if (typed.length > target.length) {
        html += `<span class="typing-char is-bad">${escapeHtml(typed.slice(target.length))}</span>`;
    }
    return html;
}

export function render(container) {
    let target = nextDrill();
    let startedAt = 0;
    let keystrokes = 0;
    let correctKeystrokes = 0;
    let correctChars = 0;
    let combo = 0;
    let bestCombo = 0;
    let completed = 0;
    let hadErrorThisDrill = false;

    container.innerHTML = `
        <section class="container typing-page">
            <h2 class="page-title">타자연습 모드</h2>
            <p class="page-desc">화면의 CSS 선택자를 똑같이, 빠르고 정확하게 타이핑하고 Enter로 넘기세요.</p>

            <dl class="typing-stats">
                <div><dt>타 / 분</dt><dd data-role="wpm">0</dd></div>
                <div><dt>정확도 %</dt><dd data-role="acc">100</dd></div>
                <div><dt>콤보</dt><dd data-role="combo">0</dd></div>
            </dl>

            <pre class="typing-answer" data-role="target"></pre>

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
        input: container.querySelector('[data-role="input"]'),
        feedback: container.querySelector('[data-role="feedback"]'),
        wpm: container.querySelector('[data-role="wpm"]'),
        acc: container.querySelector('[data-role="acc"]'),
        combo: container.querySelector('[data-role="combo"]'),
        enter: container.querySelector('[data-role="enter"]'),
        skip: container.querySelector('[data-role="skip"]')
    };

    function renderStats() {
        const minutes = startedAt ? (Date.now() - startedAt) / 60000 : 0;
        const liveChars = correctChars + [...el.input.value].filter((c, i) => c === target[i]).length;
        el.wpm.textContent = minutes > 0 ? Math.round(liveChars / minutes) : 0;
        el.acc.textContent = keystrokes > 0 ? Math.round((correctKeystrokes / keystrokes) * 100) : 100;
        el.combo.textContent = combo;
    }

    function loadDrill(resetCombo) {
        if (resetCombo) combo = 0;
        hadErrorThisDrill = false;
        target = nextDrill();
        el.input.value = '';
        el.target.innerHTML = renderTarget(target, '');
        el.feedback.textContent = '';
        el.input.focus();
        renderStats();
    }

    function submit() {
        if (el.input.value !== target) {
            el.feedback.textContent = '아직 정확히 일치하지 않습니다.';
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
        if (completed % 5 === 0) {
            addTypingRecord({
                wpm: Number(el.wpm.textContent),
                accuracy: Number(el.acc.textContent),
                combo: bestCombo,
                difficulty: 'all'
            });
        }
        el.feedback.textContent = '정확해요!';
        loadDrill(false);
    }

    function onInput() {
        if (!startedAt) startedAt = Date.now();
        const typed = el.input.value;
        keystrokes += 1;
        const pos = typed.length - 1;
        if (pos >= 0 && typed[pos] === target[pos]) correctKeystrokes += 1;
        else if (pos >= 0) hadErrorThisDrill = true;
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
