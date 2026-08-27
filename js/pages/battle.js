import { BATTLE_PROBLEMS } from '../core/problems.js';
import { judgeSpecificity } from '../core/battleJudge.js';

function buildPreviewDoc(domHtml, cssRules) {
    return `<!doctype html><html><head><style>
        body { margin:0; padding:16px; font-family: sans-serif; background:#fff; color:#111; }
        ${cssRules.join('\n')}
    </style></head><body>${domHtml}</body></html>`;
}

export function render(container) {
    let difficulty = 'low';
    let mode = 'solo';

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

            <div class="battle-layout">
                <div>
                    <div class="battle-panel-title">DOM 구조</div>
                    <pre class="dom-tree" data-role="dom-tree"></pre>

                    <div class="battle-panel-title" style="margin-top:16px;">목표 디자인 시안</div>
                    <iframe class="preview-frame" data-role="target-frame" sandbox="" title="목표 디자인 시안"></iframe>
                    <p class="hint-text" data-role="hint"></p>
                </div>

                <div>
                    <div class="battle-panel-title">CSS 작성 (상대 규칙을 이겨서 시안과 같게 만드세요)</div>
                    <textarea class="css-editor" data-role="css-input" spellcheck="false" placeholder=".selector { color: #00E5FF; }"></textarea>

                    <div class="battle-panel-title" style="margin-top:16px;">실시간 미리보기</div>
                    <iframe class="preview-frame" data-role="live-frame" sandbox="" title="실시간 미리보기"></iframe>

                    <button type="button" class="btn btn-point" data-role="submit-btn" style="margin-top:16px;">FIGHT</button>

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
    const difficultyTabs = container.querySelector('[data-role="difficulty-tabs"]');
    const modeTabs = container.querySelector('[data-role="mode-tabs"]');

    function currentProblem() {
        return BATTLE_PROBLEMS[difficulty];
    }

    function updateLivePreview() {
        const problem = currentProblem();
        liveFrame.srcdoc = buildPreviewDoc(problem.domHtml, [problem.opponentRule, cssInput.value]);
    }

    function renderProblem() {
        const problem = currentProblem();
        domTreeEl.textContent = problem.domHtml;
        targetFrame.srcdoc = buildPreviewDoc(problem.domHtml, [problem.opponentRule, problem.targetExtraRule]);
        hintEl.textContent = problem.hint;
        cssInput.value = '';
        resultEl.innerHTML = '';
        updateLivePreview();
    }

    function renderModeNote() {
        modeNoteEl.textContent = mode === 'solo'
            ? '솔로 타임어택: 제한시간·기록 저장 기능은 다음 단계에서 추가됩니다. 지금은 판정 로직만 확인할 수 있습니다.'
            : '가상 상대 대결: HP바·KO 연출은 다음 단계에서 추가됩니다. 지금은 판정 로직만 확인할 수 있습니다.';
    }

    function setActiveTab(tabsEl, value) {
        tabsEl.querySelectorAll('.tabs-btn').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.value === value);
        });
    }

    function onDifficultyClick(e) {
        const btn = e.target.closest('.tabs-btn');
        if (!btn) return;
        difficulty = btn.dataset.value;
        setActiveTab(difficultyTabs, difficulty);
        renderProblem();
    }

    function onModeClick(e) {
        const btn = e.target.closest('.tabs-btn');
        if (!btn) return;
        mode = btn.dataset.value;
        setActiveTab(modeTabs, mode);
        renderModeNote();
    }

    function onSubmit() {
        const problem = currentProblem();
        const judged = judgeSpecificity(cssInput.value, problem.opponentRule);

        if (!judged.valid) {
            resultEl.innerHTML = `<p class="result-badge result-badge-lose">${judged.reason}</p>`;
            return;
        }

        const badge = judged.wonSpecificity
            ? '<span class="result-badge result-badge-win">특이도 승리</span>'
            : judged.tie
                ? '<span class="result-badge result-badge-lose">무승부 (나중에 온 규칙이 적용됩니다)</span>'
                : '<span class="result-badge result-badge-lose">특이도 패배</span>';

        const rows = [
            { label: '내 규칙', spec: judged.userRule.spec, selector: judged.userRule.selector },
            { label: '상대 규칙', spec: judged.opponentRule.spec, selector: judged.opponentRule.selector }
        ];

        resultEl.innerHTML = `
            ${badge}
            <div class="table-scroll">
                <table class="specificity-table">
                    <thead>
                        <tr><th>규칙</th><th>인라인</th><th>ID</th><th>클래스</th><th>태그</th><th>important</th></tr>
                    </thead>
                    <tbody>
                        ${rows.map((r) => `
                            <tr>
                                <td>${r.label} (<code>${r.selector}</code>)</td>
                                <td>${r.spec.inline}</td>
                                <td>${r.spec.id}</td>
                                <td>${r.spec.class}</td>
                                <td>${r.spec.tag}</td>
                                <td>${r.spec.important ? 'O' : '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <p class="hint-text">시안 일치(색상·레이아웃까지 정확히 맞았는지) 판정은 다음 단계에서 추가됩니다. 지금은 특이도 승패만 판정합니다.</p>
        `;
    }

    difficultyTabs.addEventListener('click', onDifficultyClick);
    modeTabs.addEventListener('click', onModeClick);
    cssInput.addEventListener('input', updateLivePreview);
    container.querySelector('[data-role="submit-btn"]').addEventListener('click', onSubmit);

    setActiveTab(difficultyTabs, difficulty);
    setActiveTab(modeTabs, mode);
    renderModeNote();
    renderProblem();
}
