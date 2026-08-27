import { BATTLE_POOLS } from '../core/battleProblems.js';
import { judgeBattle } from '../core/battleJudge.js';
import { healthBarHtml } from '../components/healthbar.js';
import { addBattleRecord } from '../store.js';

function buildPreviewDoc(domHtml, cssRules) {
    return `<!doctype html><html><head><style>
        body { margin:0; padding:16px; font-family: sans-serif; background:#fff; color:#111; }
        ${cssRules.filter(Boolean).join('\n')}
    </style></head><body>${domHtml}</body></html>`;
}

const MODE_NOTE = {
    solo: '솔로 타임어택 · 문제는 같습니다. 실패 없이 될 때까지 도전하고, 시작~완료까지 걸린 시간이 기록됩니다.',
    ghost: '가상 상대 대결 · 문제는 같습니다. 상대 규칙을 "적"으로 삼아, 특이도로 이기고 시안까지 맞으면 KO. 실패하면 내 HP가 깎입니다.'
};

const lastShownId = { low: null, mid: null, high: null };

function nextProblem(difficulty) {
    const pool = BATTLE_POOLS[difficulty];
    const candidates = pool.length > 1 ? pool.filter((p) => p.id !== lastShownId[difficulty]) : pool;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    lastShownId[difficulty] = picked.id;
    return picked;
}

export function render(container) {
    let difficulty = 'low';
    let mode = 'solo';
    let phase = 'idle';           // idle | running | result
    let problem = nextProblem(difficulty);
    let timerId = null;
    let elapsed = 0;
    let myHp = 100;
    let oppHp = 100;
    let lastResult = null;

    container.innerHTML = `
        <section class="container battle-page">
            <h1 class="page-title">배틀 모드</h1>
            <p class="page-desc">이미 적용된 상대 CSS 규칙을 특이도로 이겨서, 렌더링 결과를 목표 시안과 똑같이 만드세요.</p>

            <div class="battle-bar">
                <div class="tabs" data-role="difficulty-tabs">
                    <button type="button" class="tabs-btn" data-value="low">초급</button>
                    <button type="button" class="tabs-btn" data-value="mid">중급</button>
                    <button type="button" class="tabs-btn" data-value="high">고급</button>
                </div>
                <div class="tabs" data-role="mode-tabs">
                    <button type="button" class="tabs-btn" data-value="solo">솔로 타임어택</button>
                    <button type="button" class="tabs-btn" data-value="ghost">가상 상대 대결</button>
                </div>
                <div class="battle-actions">
                    <button type="button" class="btn btn-point" data-role="fight-btn">FIGHT</button>
                    <button type="button" class="btn btn-ghost" data-role="stop-btn" disabled>정지</button>
                    <button type="button" class="btn" data-role="done-btn" disabled>완료</button>
                </div>
            </div>

            <p class="hint-text" data-role="mode-note"></p>
            <div class="battle-status" data-role="status"></div>

            <div class="battle-layout">
                <div class="battle-col">
                    <h2 class="battle-panel-title">DOM 구조 <span data-role="problem-name"></span></h2>
                    <pre class="dom-tree" data-role="dom-tree"></pre>

                    <h2 class="battle-panel-title">목표 디자인 시안</h2>
                    <iframe class="preview-frame" data-role="target-frame" sandbox="allow-same-origin" title="목표 디자인 시안"></iframe>
                    <p class="hint-text" data-role="hint"></p>
                </div>

                <div class="battle-col">
                    <h2 class="battle-panel-title">CSS 작성</h2>
                    <textarea class="css-editor" data-role="css-input" spellcheck="false" placeholder="시작을 누르면 입력할 수 있습니다"></textarea>

                    <h2 class="battle-panel-title">현재 렌더링 (상대 규칙 + 내 코드)</h2>
                    <iframe class="preview-frame preview-frame-lg" data-role="live-frame" sandbox="allow-same-origin" title="현재 렌더링"></iframe>
                </div>
            </div>

            <div class="battle-result" data-role="result"></div>
            <div class="battle-actions" data-role="result-actions" hidden>
                <button type="button" class="btn btn-ghost" data-role="save-btn">전적에 저장</button>
            </div>
        </section>
    `;

    const el = {
        domTree: container.querySelector('[data-role="dom-tree"]'),
        targetFrame: container.querySelector('[data-role="target-frame"]'),
        liveFrame: container.querySelector('[data-role="live-frame"]'),
        cssInput: container.querySelector('[data-role="css-input"]'),
        result: container.querySelector('[data-role="result"]'),
        resultActions: container.querySelector('[data-role="result-actions"]'),
        hint: container.querySelector('[data-role="hint"]'),
        modeNote: container.querySelector('[data-role="mode-note"]'),
        status: container.querySelector('[data-role="status"]'),
        problemName: container.querySelector('[data-role="problem-name"]'),
        difficultyTabs: container.querySelector('[data-role="difficulty-tabs"]'),
        modeTabs: container.querySelector('[data-role="mode-tabs"]')
    };
    const btn = {
        fight: container.querySelector('[data-role="fight-btn"]'),
        stop: container.querySelector('[data-role="stop-btn"]'),
        done: container.querySelector('[data-role="done-btn"]'),
        save: container.querySelector('[data-role="save-btn"]')
    };

    function opponentCss() {
        return problem.opponentRules || [problem.opponentRule];
    }

    function stopTimer() {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }

    function formatTime(sec) {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function renderStatus() {
        if (mode === 'solo') {
            el.status.innerHTML = `<span class="battle-timer">⏱ ${formatTime(elapsed)}</span>`;
        } else {
            el.status.innerHTML = healthBarHtml('내 HP', myHp) + healthBarHtml('상대 HP', oppHp);
        }
    }

    function updateLivePreview() {
        el.liveFrame.srcdoc = buildPreviewDoc(problem.domHtml, [...opponentCss(), el.cssInput.value]);
    }

    function setPhase(next) {
        phase = next;
        const idle = phase === 'idle';
        const running = phase === 'running';
        const result = phase === 'result';

        btn.fight.textContent = result ? '다음 문제 ▶' : 'FIGHT';
        btn.fight.disabled = running;
        btn.stop.disabled = !running;
        btn.done.disabled = !running;
        el.cssInput.disabled = !running;
        el.difficultyTabs.classList.toggle('is-locked', !idle);
        el.modeTabs.classList.toggle('is-locked', !idle);
        el.resultActions.hidden = !(result && lastResult?.valid);
        renderStatus();
    }

    function loadProblem(pickNew = true) {
        stopTimer();
        if (pickNew) problem = nextProblem(difficulty);
        elapsed = 0;
        myHp = 100;
        oppHp = 100;
        lastResult = null;
        el.problemName.textContent = `— ${problem.name}`;
        el.domTree.textContent = problem.domHtml;
        el.targetFrame.srcdoc = buildPreviewDoc(problem.domHtml, [...opponentCss(), problem.targetCss || problem.targetExtraRule]);
        el.hint.textContent = problem.hint;
        el.cssInput.value = '';
        el.result.innerHTML = '';
        updateLivePreview();
        setPhase('idle');
    }

    function startBattle() {
        if (phase === 'result') { loadProblem(true); return; }
        stopTimer();
        elapsed = 0;
        setPhase('running');
        el.cssInput.focus();
        if (mode !== 'solo') { renderStatus(); return; }
        timerId = setInterval(() => { elapsed += 1; renderStatus(); }, 1000);
    }

    function setActiveTab(tabsEl, value) {
        tabsEl.querySelectorAll('.tabs-btn').forEach((b) => {
            b.classList.toggle('is-active', b.dataset.value === value);
        });
    }

    function specRow(label, rule) {
        return `
            <tr>
                <td>${label} (<code>${rule.selector}</code>)</td>
                <td>${rule.spec.inline}</td>
                <td>${rule.spec.id}</td>
                <td>${rule.spec.class}</td>
                <td>${rule.spec.tag}</td>
                <td>${rule.spec.important ? 'O' : '-'}</td>
            </tr>
        `;
    }

    function submit() {
        const doc = el.liveFrame.contentDocument;
        if (!doc) {
            el.result.innerHTML = `<p class="result-badge result-badge-lose">미리보기를 불러오는 중입니다. 잠시 후 다시 시도하세요.</p>`;
            return;
        }
        showResult(judgeBattle({ doc, userCssText: el.cssInput.value, problem }));
    }

    function showResult(judged) {
        stopTimer();
        lastResult = judged;
        setPhase('result');

        if (!judged.valid) {
            el.result.innerHTML = `<p class="result-badge result-badge-lose">${judged.reason}</p>`;
            el.resultActions.hidden = true;
            return;
        }

        const won = judged.result === 'win';
        if (mode === 'ghost') {
            if (!judged.wonSpecificity) myHp -= 45;
            if (!judged.matchedDesign) myHp -= 35;
            if (won) oppHp = 0;
            renderStatus();
        }

        const parts = [];
        parts.push(won
            ? `<p class="result-badge result-badge-win">승리</p> ${mode === 'ghost' ? '<span class="ko-stamp">K.O.</span>' : ''} ${mode === 'solo' ? `<span class="battle-clear-time">클리어 ${formatTime(elapsed)}</span>` : ''}`
            : `<p class="result-badge result-badge-lose">아직이에요</p>`);

        const missing = [];
        if (!judged.selectorMatches) {
            missing.push('작성한 셀렉터가 목표 엘리먼트에 매칭되지 않습니다.');
        } else if (!judged.wonSpecificity) {
            missing.push(judged.tie
                ? '특이도가 상대와 같습니다. 나중에 온 규칙이 이기지만, 시안 값까지 정확히 맞춰야 합니다.'
                : '특이도에서 상대 규칙에 밀립니다. 클래스/ID를 더 붙여보세요.');
        }
        if (!judged.matchedDesign && judged.mismatches?.length) {
            missing.push('시안과 다른 속성: ' + judged.mismatches
                .map((m) => `${m.prop}(기대 ${m.expected} / 현재 ${m.actual})`).join(', '));
        }
        if (missing.length) {
            parts.push(`<ul class="battle-feedback">${missing.map((m) => `<li>${m}</li>`).join('')}</ul>`);
        }

        parts.push(`
            <div class="table-scroll">
                <table class="specificity-table">
                    <thead><tr><th>규칙</th><th>인라인</th><th>ID</th><th>클래스</th><th>태그</th><th>important</th></tr></thead>
                    <tbody>
                        ${specRow('내 규칙', judged.userRule)}
                        ${specRow('상대 규칙', judged.opponentRule)}
                    </tbody>
                </table>
            </div>
            <p class="hint-text">시안 일치는 픽셀 단위가 아닌 렌더링 결과(computed style) 근사 비교입니다.</p>
        `);

        el.result.innerHTML = parts.join('');
    }

    function onSave() {
        if (!lastResult?.valid) return;
        addBattleRecord({
            mode, difficulty,
            selector: lastResult.userRule?.selector || '',
            wonSpecificity: !!lastResult.wonSpecificity,
            matchedDesign: !!lastResult.matchedDesign,
            timeSec: elapsed,
            result: lastResult.result
        });
        btn.save.disabled = true;
        btn.save.textContent = '저장됨';
        setTimeout(() => { btn.save.disabled = false; btn.save.textContent = '전적에 저장'; }, 1500);
    }

    el.difficultyTabs.addEventListener('click', (e) => {
        if (phase !== 'idle') return;
        const b = e.target.closest('.tabs-btn');
        if (!b) return;
        difficulty = b.dataset.value;
        setActiveTab(el.difficultyTabs, difficulty);
        loadProblem(true);
    });
    el.modeTabs.addEventListener('click', (e) => {
        if (phase !== 'idle') return;
        const b = e.target.closest('.tabs-btn');
        if (!b) return;
        mode = b.dataset.value;
        setActiveTab(el.modeTabs, mode);
        el.modeNote.textContent = MODE_NOTE[mode];
        loadProblem(false);
    });
    el.cssInput.addEventListener('input', updateLivePreview);
    btn.fight.addEventListener('click', startBattle);
    btn.stop.addEventListener('click', () => loadProblem(false));
    btn.done.addEventListener('click', submit);
    btn.save.addEventListener('click', onSave);

    setActiveTab(el.difficultyTabs, difficulty);
    setActiveTab(el.modeTabs, mode);
    el.modeNote.textContent = MODE_NOTE[mode];
    loadProblem(false);

    return () => stopTimer();
}
