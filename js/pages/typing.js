import { generateProblem, validateSelector, adaptDifficulty } from '../core/problemGenerator.js';
import { addTypingRecord } from '../store.js';

function highlightHtml(answer, typed) {
    let out = '';
    for (let i = 0; i < answer.length; i++) {
        const ch = answer[i].replace('<', '&lt;');
        if (i >= typed.length) out += `<span class="typing-char">${ch}</span>`;
        else if (typed[i] === answer[i]) out += `<span class="typing-char is-ok">${ch}</span>`;
        else out += `<span class="typing-char is-bad">${ch}</span>`;
    }
    if (typed.length > answer.length) {
        out += `<span class="typing-char is-bad">${typed.slice(answer.length).replace(/</g, '&lt;')}</span>`;
    }
    return out;
}

export function render(container) {
    let difficulty = 'low';
    let autoAdapt = true;
    let problem = null;
    let startedAt = 0;
    let keystrokes = 0;
    let correctKeystrokes = 0;
    let combo = 0;
    let bestCombo = 0;
    const recentResults = [];

    container.innerHTML = `
        <section class="container typing-page">
            <h1 class="page-title">타자연습 모드</h1>
            <p class="page-desc">DOM 구조를 보고 조건에 맞는 셀렉터를 직접 타이핑하며 반복 연습합니다.</p>

            <div class="battle-controls">
                <div class="tabs" data-role="difficulty-tabs">
                    <button type="button" class="tabs-btn" data-value="low">초급</button>
                    <button type="button" class="tabs-btn" data-value="mid">중급</button>
                    <button type="button" class="tabs-btn" data-value="high">고급</button>
                </div>
                <label class="typing-adapt">
                    <input type="checkbox" data-role="adapt" checked> 적응형 난이도
                </label>
            </div>

            <dl class="typing-stats">
                <div><dt>타수</dt><dd data-role="wpm">0</dd><span>타/분</span></div>
                <div><dt>정확도</dt><dd data-role="acc">100</dd><span>%</span></div>
                <div><dt>콤보</dt><dd data-role="combo">0</dd><span>연속</span></div>
            </dl>

            <h2 class="battle-panel-title">DOM 트리 (data-target 표시가 목표 엘리먼트)</h2>
            <pre class="dom-tree" data-role="dom-tree"></pre>

            <p class="typing-mission" data-role="mission"></p>

            <div class="typing-answer" data-role="answer"></div>
            <input type="text" class="css-editor typing-input" data-role="input" spellcheck="false" autocomplete="off" placeholder="셀렉터 입력 후 Enter">

            <p class="hint-text" data-role="feedback"></p>
        </section>
    `;

    const difficultyTabs = container.querySelector('[data-role="difficulty-tabs"]');
    const adaptEl = container.querySelector('[data-role="adapt"]');
    const domTreeEl = container.querySelector('[data-role="dom-tree"]');
    const missionEl = container.querySelector('[data-role="mission"]');
    const answerEl = container.querySelector('[data-role="answer"]');
    const inputEl = container.querySelector('[data-role="input"]');
    const feedbackEl = container.querySelector('[data-role="feedback"]');
    const wpmEl = container.querySelector('[data-role="wpm"]');
    const accEl = container.querySelector('[data-role="acc"]');
    const comboEl = container.querySelector('[data-role="combo"]');

    function setActiveTab(value) {
        difficultyTabs.querySelectorAll('.tabs-btn').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.value === value);
        });
    }

    function renderStats() {
        const minutes = startedAt ? (Date.now() - startedAt) / 60000 : 0;
        const wpm = minutes > 0 ? Math.round(keystrokes / minutes) : 0;
        const acc = keystrokes > 0 ? Math.round((correctKeystrokes / keystrokes) * 100) : 100;
        wpmEl.textContent = wpm;
        accEl.textContent = acc;
        comboEl.textContent = combo;
        return { wpm, acc };
    }

    function nextProblem() {
        problem = generateProblem(difficulty);
        domTreeEl.textContent = problem.markedHtml;
        missionEl.textContent = problem.mission;
        inputEl.value = '';
        answerEl.innerHTML = highlightHtml(problem.answer, '');
        feedbackEl.textContent = `예시 정답: ${problem.answer} (똑같이 치지 않아도 조건만 맞으면 정답)`;
        inputEl.focus();
    }

    function onInput() {
        if (!startedAt) startedAt = Date.now();
        const typed = inputEl.value;
        keystrokes += 1;
        if (problem.answer.startsWith(typed)) correctKeystrokes += 1;
        answerEl.innerHTML = highlightHtml(problem.answer, typed);
        renderStats();
    }

    function onSubmit() {
        const res = validateSelector(problem, inputEl.value);
        if (!res.valid) {
            feedbackEl.textContent = res.reason;
            return;
        }
        if (res.pass) {
            combo += 1;
            bestCombo = Math.max(bestCombo, combo);
            recentResults.push(true);
        } else {
            combo = 0;
            recentResults.push(false);
        }
        const { wpm, acc } = renderStats();

        if (!res.pass) {
            feedbackEl.textContent = `${res.reason} 콤보가 끊겼습니다.`;
            return;
        }
        addTypingRecord({ wpm, accuracy: acc, combo: bestCombo, difficulty });
        if (autoAdapt) {
            const nextDiff = adaptDifficulty(difficulty, recentResults);
            if (nextDiff !== difficulty) {
                difficulty = nextDiff;
                setActiveTab(difficulty);
            }
        }
        nextProblem();
    }

    difficultyTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tabs-btn');
        if (!btn) return;
        difficulty = btn.dataset.value;
        setActiveTab(difficulty);
        nextProblem();
    });
    adaptEl.addEventListener('change', () => { autoAdapt = adaptEl.checked; });
    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); onSubmit(); }
    });

    setActiveTab(difficulty);
    nextProblem();
}
