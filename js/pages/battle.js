import { BATTLE_PROBLEMS } from '../core/problems.js';
import { judgeBattle } from '../core/battleJudge.js';
import { healthBarHtml } from '../components/healthbar.js';
import { addBattleRecord } from '../store.js';

function buildPreviewDoc(domHtml, cssRules) {
    return `<!doctype html><html><head><style>
        body { margin:0; padding:16px; font-family: sans-serif; background:#fff; color:#111; }
        ${cssRules.join('\n')}
    </style></head><body>${domHtml}</body></html>`;
}

const MODE_NOTE = {
    solo: '솔로 타임어택: 시작을 누르면 제한시간이 흐릅니다. 상대 규칙을 특이도로 이기고 시안과 똑같이 만들면 클리어, 소요시간이 기록됩니다.',
    ghost: '가상 상대 대결: 상대 규칙이 "적"입니다. 특이도 패배 시 내 HP, 시안 불일치 시에도 내 HP가 깎입니다. 둘 다 통과하면 상대 KO.'
};

const TIME_LIMIT_SEC = 90;

export function render(container) {
    let difficulty = 'low';
    let mode = 'solo';
    let phase = 'idle';           // idle | running | result
    let timerId = null;
    let elapsed = 0;
    let myHp = 100;
    let oppHp = 100;
    let lastResult = null;

    container.innerHTML = `
        <section class="container battle-page">
            <h1 class="page-title">배틀 모드</h1>
            <p class="page-desc">구조와 디자인 시안을 보고, 이미 적용된 상대 CSS 규칙을 특이도로 이겨서 시안과 똑같이 만드세요.</p>

            <div class="battle-controls">
                <div class="tabs" data-role="difficulty-tabs">
                    <button type="button" class="tabs-btn" data-value="low">초급</button>
                    <button type="button" class="tabs-btn" data-value="mid">중급</button>
                    <button type="button" class="tabs-btn" data-value="high">고급</button>
                </div>
                <div class="tabs" data-role="mode-tabs">
                    <button type="button" class="tabs-btn" data-value="solo">솔로 타임어택</button>
                    <button type="button" class="tabs-btn" data-value="ghost">가상 상대 대결</button>
                </div>
            </div>

            <p class="hint-text" data-role="mode-note"></p>

            <div class="battle-status" data-role="status"></div>

            <div class="battle-layout">
                <div class="battle-col">
                    <h2 class="battle-panel-title">DOM 구조</h2>
                    <pre class="dom-tree" data-role="dom-tree"></pre>

                    <h2 class="battle-panel-title">목표 디자인 시안</h2>
                    <iframe class="preview-frame" data-role="target-frame" sandbox="allow-same-origin" title="목표 디자인 시안"></iframe>
                    <p class="hint-text" data-role="hint"></p>
                </div>

                <div class="battle-col">
                    <h2 class="battle-panel-title">CSS 작성 (상대 규칙을 이겨서 시안과 같게 만드세요)</h2>
                    <textarea class="css-editor" data-role="css-input" spellcheck="false" placeholder=".selector { color: #00E5FF; }"></textarea>

                    <h2 class="battle-panel-title">현재 렌더링 (상대 규칙 + 내 규칙)</h2>
                    <iframe class="preview-frame" data-role="live-frame" sandbox="allow-same-origin" title="현재 렌더링"></iframe>

                    <div class="battle-actions" data-role="actions">
                        <button type="button" class="btn btn-point" data-role="start-btn">▶ 시작</button>
                        <button type="button" class="btn btn-point" data-role="submit-btn" hidden>제출</button>
                        <button type="button" class="btn btn-ghost" data-role="giveup-btn" hidden>포기</button>
                        <button type="button" class="btn" data-role="next-btn" hidden>다음 문제</button>
                        <button type="button" class="btn btn-ghost" data-role="retry-btn" hidden>다시 도전</button>
                        <button type="button" class="btn btn-ghost" data-role="save-btn" hidden>전적에 저장</button>
                    </div>

                    <div data-role="result"></div>
                </div>
            </div>
        </section>
    `;

    const domTreeEl = container.querySelector('[data-role="dom-tree"]');
    const targetFrame = container.querySelector('[data-role="target-frame"]');
    const liveFrame = container.querySelector('[data-role="live-frame"]');
    const cssInput = container.querySelector('[data-role="css-input"]');
    const resultEl = container.querySelector('[data-role="result"]');
    const hintEl = container.querySelector('[data-role="hint"]');
    const modeNoteEl = container.querySelector('[data-role="mode-note"]');
    const statusEl = container.querySelector('[data-role="status"]');
    const difficultyTabs = container.querySelector('[data-role="difficulty-tabs"]');
    const modeTabs = container.querySelector('[data-role="mode-tabs"]');

    const btn = {
        start: container.querySelector('[data-role="start-btn"]'),
        submit: container.querySelector('[data-role="submit-btn"]'),
        giveup: container.querySelector('[data-role="giveup-btn"]'),
        next: container.querySelector('[data-role="next-btn"]'),
        retry: container.querySelector('[data-role="retry-btn"]'),
        save: container.querySelector('[data-role="save-btn"]')
    };

    function currentProblem() {
        return BATTLE_PROBLEMS[difficulty];
    }

    function stopTimer() {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }

    function renderStatus() {
        if (mode === 'solo') {
            const remain = Math.max(0, TIME_LIMIT_SEC - elapsed);
            const label = phase === 'idle' ? `제한 시간 ${TIME_LIMIT_SEC}s` : `남은 시간 ${remain}s`;
            statusEl.innerHTML = `<span class="battle-timer${phase !== 'idle' && remain <= 15 ? ' is-low' : ''}">${label}</span>`;
        } else {
            statusEl.innerHTML = healthBarHtml('내 HP', myHp) + healthBarHtml('상대 HP', oppHp);
        }
    }

    function updateLivePreview() {
        const problem = currentProblem();
        liveFrame.srcdoc = buildPreviewDoc(problem.domHtml, [problem.opponentRule, cssInput.value]);
    }

    function setPhase(next) {
        phase = next;
        const idle = phase === 'idle';
        const running = phase === 'running';
        const result = phase === 'result';

        btn.start.hidden = !idle;
        btn.submit.hidden = !running;
        btn.giveup.hidden = !running;
        btn.next.hidden = !result;
        btn.retry.hidden = !result;
        btn.save.hidden = !result || !lastResult?.valid;

        cssInput.disabled = !running;
        difficultyTabs.classList.toggle('is-locked', !idle);
        modeTabs.classList.toggle('is-locked', !idle);

        renderStatus();
    }

    function loadProblem() {
        const problem = currentProblem();
        stopTimer();
        elapsed = 0;
        myHp = 100;
        oppHp = 100;
        lastResult = null;
        domTreeEl.textContent = problem.domHtml;
        targetFrame.srcdoc = buildPreviewDoc(problem.domHtml, [problem.opponentRule, problem.targetExtraRule]);
        hintEl.textContent = problem.hint;
        cssInput.value = '';
        resultEl.innerHTML = '';
        updateLivePreview();
        setPhase('idle');
    }

    function startBattle() {
        stopTimer();
        elapsed = 0;
        setPhase('running');
        cssInput.focus();
        if (mode !== 'solo') return;
        timerId = setInterval(() => {
            elapsed += 1;
            renderStatus();
            if (elapsed >= TIME_LIMIT_SEC) {
                stopTimer();
                showResult({ valid: true, result: 'lose', timeout: true });
            }
        }, 1000);
    }

    function giveUp() {
        loadProblem();
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

    function showResult(judged) {
        stopTimer();
        lastResult = judged;
        setPhase('result');

        if (!judged.valid) {
            resultEl.innerHTML = `<p class="result-badge result-badge-lose">${judged.reason}</p>`;
            return;
        }

        if (judged.timeout) {
            resultEl.innerHTML = `<p class="result-badge result-badge-lose">시간 초과! 다시 도전해보세요.</p>`;
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
            ? `<p class="result-badge result-badge-win">승리</p> ${mode === 'ghost' ? '<span class="ko-stamp">K.O.</span>' : ''}`
            : `<p class="result-badge result-badge-lose">패배</p>`);

        const missing = [];
        if (!judged.wonSpecificity) {
            missing.push(judged.tie
                ? '특이도 무승부입니다. 상대보다 강한 셀렉터가 필요해요.'
                : judged.selectorMatches
                    ? '특이도에서 상대에게 밀립니다.'
                    : '작성한 셀렉터가 대상 엘리먼트에 매칭되지 않습니다.');
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
                    <thead>
                        <tr><th>규칙</th><th>인라인</th><th>ID</th><th>클래스</th><th>태그</th><th>important</th></tr>
                    </thead>
                    <tbody>
                        ${specRow('내 규칙', judged.userRule)}
                        ${specRow('상대 규칙', judged.opponentRule)}
                    </tbody>
                </table>
            </div>
            <p class="hint-text">시안 일치는 픽셀 단위가 아닌 렌더링 결과(computed style) 근사 비교입니다.</p>
        `);

        resultEl.innerHTML = parts.join('');
    }

    function onSubmit() {
        const problem = currentProblem();
        const doc = liveFrame.contentDocument;
        if (!doc) {
            resultEl.innerHTML = `<p class="result-badge result-badge-lose">미리보기를 불러오는 중입니다. 잠시 후 다시 시도하세요.</p>`;
            return;
        }
        showResult(judgeBattle({ doc, userCssText: cssInput.value, problem }));
    }

    function onSave() {
        if (!lastResult?.valid) return;
        addBattleRecord({
            mode,
            difficulty,
            selector: lastResult.userRule?.selector || '',
            wonSpecificity: !!lastResult.wonSpecificity,
            matchedDesign: !!lastResult.matchedDesign,
            timeSec: elapsed,
            result: lastResult.result
        });
        btn.save.hidden = true;
        btn.save.textContent = '저장됨';
        setTimeout(() => { btn.save.textContent = '전적에 저장'; }, 1500);
    }

    function onDifficultyClick(e) {
        if (phase !== 'idle') return;
        const b = e.target.closest('.tabs-btn');
        if (!b) return;
        difficulty = b.dataset.value;
        setActiveTab(difficultyTabs, difficulty);
        loadProblem();
    }

    function onModeClick(e) {
        if (phase !== 'idle') return;
        const b = e.target.closest('.tabs-btn');
        if (!b) return;
        mode = b.dataset.value;
        setActiveTab(modeTabs, mode);
        modeNoteEl.textContent = MODE_NOTE[mode];
        loadProblem();
    }

    difficultyTabs.addEventListener('click', onDifficultyClick);
    modeTabs.addEventListener('click', onModeClick);
    cssInput.addEventListener('input', updateLivePreview);
    btn.start.addEventListener('click', startBattle);
    btn.submit.addEventListener('click', onSubmit);
    btn.giveup.addEventListener('click', giveUp);
    btn.next.addEventListener('click', loadProblem);
    btn.retry.addEventListener('click', loadProblem);
    btn.save.addEventListener('click', onSave);

    setActiveTab(difficultyTabs, difficulty);
    setActiveTab(modeTabs, mode);
    modeNoteEl.textContent = MODE_NOTE[mode];
    loadProblem();

    return () => stopTimer();
}
