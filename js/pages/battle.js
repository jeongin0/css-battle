import { previewDoc, nextBattleProblem, obfuscatedShown } from '../core/battleProblems.js';
import { selectorHygiene } from '../core/battleScore.js';
import { calculateSpecificity } from '../core/specificity.js';
import { attachCodeEditor } from '../components/cssEditor.js';
import { addBattleClear } from '../store.js';

export function render(container) {
    let difficulty = 'low';
    let phase = 'idle';
    let problem = nextBattleProblem(difficulty);
    let timerId = null;
    let elapsed = 0;
    let hintLines = [];
    let hintShown = 0;
    let counted = false;

    container.innerHTML = `
        <section class="container battle-page">
            <h2 class="page-title">배틀 모드</h2>
            <p class="page-desc">목표 시안과 똑같이 보이도록 CSS를 0부터 작성하는 <strong>모작 연습</strong>입니다. 정답은 하나가 아니라서 점수는 매기지 않아요 — 겹쳐보기와 예시 정답으로 직접 확인하세요.</p>

            <div class="battle-bar">
                <div class="tabs" data-role="difficulty-tabs">
                    <button type="button" class="tabs-btn" data-value="low">초급</button>
                    <button type="button" class="tabs-btn" data-value="mid">중급</button>
                    <button type="button" class="tabs-btn" data-value="high">고급</button>
                </div>
                <div class="battle-actions">
                    <button type="button" class="btn btn-main" data-role="fight-btn">FIGHT</button>
                    <button type="button" class="btn btn-ghost" data-role="stop-btn" disabled>정지</button>
                    <button type="button" class="btn" data-role="done-btn" disabled>완료</button>
                </div>
            </div>

            <p class="hint-text">FIGHT = 스톱워치 시작 + 에디터 열림. 난이도 탭은 언제든 눌러 새 문제를 받을 수 있어요(진행 중이던 문제는 초기화). 정지 = 기록 없이 리셋.</p>
            <div class="battle-status" data-role="status"></div>
            <p class="battle-toast" data-role="toast" hidden></p>

            <div class="battle-layout">
                <div class="battle-col">
                    <h3 class="battle-panel-title">HTML 구조 (수정 불가)</h3>
                    <pre class="dom-tree" data-role="html-src"></pre>

                    <h3 class="battle-panel-title">색상 팔레트 · 스포이드</h3>
                    <div class="battle-palette" data-role="palette"></div>

                    <h3 class="battle-panel-title">목표 시안 <span data-role="problem-name"></span></h3>
                    <div class="battle-shielded">
                        <iframe class="preview-frame preview-frame-lg" data-role="shown-frame" sandbox="allow-same-origin" title="목표 시안"></iframe>
                        <div class="battle-shield" data-role="shield"></div>
                    </div>
                </div>

                <div class="battle-col">
                    <h3 class="battle-panel-title">현재 렌더링 (실시간)</h3>
                    <div class="battle-overlay-wrap">
                        <iframe class="preview-frame preview-frame-lg" data-role="live-frame" sandbox="allow-same-origin" title="현재 렌더링"></iframe>
                        <iframe class="preview-frame preview-frame-lg battle-overlay-frame" data-role="overlay-frame" sandbox="allow-same-origin" title="시안 겹쳐보기" hidden></iframe>
                    </div>
                    <div class="battle-overlay-ctl">
                        <label><input type="checkbox" data-role="overlay-toggle"> 시안 겹쳐보기</label>
                        <input type="range" data-role="overlay-opacity" min="20" max="90" value="50" disabled>
                    </div>

                    <h3 class="battle-panel-title">CSS 작성</h3>
                    <textarea class="css-editor" data-role="css-input" spellcheck="false" placeholder="FIGHT를 누르면 입력할 수 있습니다"></textarea>
                    <div class="battle-hint" data-role="hint-box" hidden>
                        <div class="battle-hint-head">
                            <span>예시 정답 <span data-role="hint-count">0 / 0</span></span>
                            <button type="button" class="btn btn-ghost" data-role="hint-btn">힌트 한 줄 보기</button>
                        </div>
                        <pre data-role="hint-pre"></pre>
                    </div>
                </div>
            </div>

            <div class="battle-result" data-role="result"></div>
        </section>
    `;

    const el = {
        shownFrame: container.querySelector('[data-role="shown-frame"]'),
        liveFrame: container.querySelector('[data-role="live-frame"]'),
        overlayFrame: container.querySelector('[data-role="overlay-frame"]'),
        overlayToggle: container.querySelector('[data-role="overlay-toggle"]'),
        overlayOpacity: container.querySelector('[data-role="overlay-opacity"]'),
        shield: container.querySelector('[data-role="shield"]'),
        htmlSrc: container.querySelector('[data-role="html-src"]'),
        palette: container.querySelector('[data-role="palette"]'),
        cssInput: container.querySelector('[data-role="css-input"]'),
        result: container.querySelector('[data-role="result"]'),
        status: container.querySelector('[data-role="status"]'),
        toast: container.querySelector('[data-role="toast"]'),
        problemName: container.querySelector('[data-role="problem-name"]'),
        difficultyTabs: container.querySelector('[data-role="difficulty-tabs"]'),
        hintBox: container.querySelector('[data-role="hint-box"]'),
        hintBtn: container.querySelector('[data-role="hint-btn"]'),
        hintPre: container.querySelector('[data-role="hint-pre"]'),
        hintCount: container.querySelector('[data-role="hint-count"]')
    };
    const btn = {
        fight: container.querySelector('[data-role="fight-btn"]'),
        stop: container.querySelector('[data-role="stop-btn"]'),
        done: container.querySelector('[data-role="done-btn"]')
    };

    attachCodeEditor(el.cssInput);

    function stopTimer() {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }

    function formatTime(sec) {
        return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
    }

    function renderStatus() {
        el.status.innerHTML = `<span class="battle-timer">⏱ ${formatTime(elapsed)}</span>`;
    }

    let toastId = null;
    function toast(msg) {
        if (!el.toast) return;
        el.toast.textContent = msg;
        el.toast.hidden = false;
        clearTimeout(toastId);
        toastId = setTimeout(() => { el.toast.hidden = true; }, 1600);
    }

    function updateLivePreview() {
        el.liveFrame.srcdoc = previewDoc(problem.html, el.cssInput.value);
    }

    function renderPalette() {
        const swatches = problem.palette.map((hex) =>
            `<button type="button" class="battle-swatch" data-hex="${hex}" style="--sw:${hex}" title="${hex}">${hex}</button>`
        ).join('');
        const eye = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.5-3.5a2.12 2.12 0 0 1 3 3L21 9l-3-3"/><path d="m18 9-9 9"/></svg>';
        el.palette.innerHTML = swatches + (window.EyeDropper
            ? `<button type="button" class="btn btn-ghost battle-eyedropper" data-role="eyedropper">${eye} 스포이드</button>`
            : `<span class="hint-text">스포이드는 최신 Chrome/Edge에서 지원됩니다</span>`);
    }

    function insertToEditor(text) {
        const input = el.cssInput;
        if (input.disabled) {
            navigator.clipboard?.writeText(text);
            toast(`${text} 복사됨 (FIGHT 후 커서 위치에 삽입됩니다)`);
            return;
        }
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.slice(0, start) + text + input.value.slice(end);
        input.selectionStart = input.selectionEnd = start + text.length;
        input.focus();
        updateLivePreview();
    }

    function setPhase(next) {
        phase = next;
        const running = phase === 'running';
        const result = phase === 'result';
        btn.fight.textContent = result ? '다음 문제 ▶' : 'FIGHT';
        btn.fight.disabled = running;
        btn.stop.disabled = !running;
        btn.done.disabled = !running;
        el.cssInput.disabled = !running;
        el.hintBox.hidden = !running;
        renderStatus();
    }

    function resetHints() {
        hintLines = (problem.answerCss || '').split('\n').filter((l) => l.trim());
        hintShown = 0;
        el.hintPre.textContent = '';
        el.hintCount.textContent = `0 / ${hintLines.length}`;
        el.hintBtn.disabled = false;
        el.hintBtn.textContent = '힌트 한 줄 보기';
    }

    function showNextHint() {
        if (hintShown >= hintLines.length) return;
        hintShown += 1;
        el.hintPre.textContent = hintLines.slice(0, hintShown).join('\n');
        el.hintCount.textContent = `${hintShown} / ${hintLines.length}`;
        if (hintShown >= hintLines.length) {
            el.hintBtn.disabled = true;
            el.hintBtn.textContent = '예시 정답 전체 공개됨';
        }
    }

    function syncOverlay() {
        const on = el.overlayToggle.checked;
        el.overlayFrame.hidden = !on;
        el.overlayOpacity.disabled = !on;
        el.overlayFrame.style.opacity = String(el.overlayOpacity.value / 100);
    }

    function loadProblem(pickNew) {
        stopTimer();
        if (pickNew) problem = nextBattleProblem(difficulty);
        elapsed = 0;
        counted = false;
        el.problemName.textContent = `— ${problem.name}`;
        el.htmlSrc.textContent = problem.html;
        const shownDoc = obfuscatedShown(problem);
        el.shownFrame.srcdoc = shownDoc;
        el.overlayFrame.srcdoc = shownDoc;
        el.cssInput.value = '';
        el.result.innerHTML = '';
        el.overlayToggle.checked = false;
        syncOverlay();
        renderPalette();
        resetHints();
        updateLivePreview();
        setPhase('idle');
    }

    function startBattle() {
        if (phase === 'result') { loadProblem(true); return; }
        stopTimer();
        elapsed = 0;
        setPhase('running');
        el.cssInput.focus();
        timerId = setInterval(() => { elapsed += 1; renderStatus(); }, 1000);
    }

    function setActiveTab(value) {
        el.difficultyTabs.querySelectorAll('.tabs-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.value === value));
    }

    function specRows(rules) {
        return rules.map((r) => {
            const s = r.spec;
            return `<tr><td><code>${escapeHtml(r.selector)}</code></td><td>${s.id}</td><td>${s.class}</td><td>${s.tag}</td></tr>`;
        }).join('');
    }

    function submit() {
        const userDoc = el.liveFrame.contentDocument;
        if (!userDoc) {
            el.result.innerHTML = `<p class="hint-text">미리보기 로딩 중입니다. 잠시 후 완료를 다시 누르세요.</p>`;
            return;
        }
        stopTimer();
        if (!counted) { addBattleClear(); counted = true; }

        const hygiene = selectorHygiene(el.cssInput.value, userDoc, problem.root);
        setPhase('result');
        renderResult(hygiene);
    }

    function renderResult(hygiene) {
        const parts = [];

        parts.push(`<p class="battle-done-line">완료 · ${formatTime(elapsed)} 소요 · <a href="#quest">퀘스트</a>에 1판 반영됨</p>`);

        if (problem.tip) {
            parts.push(`<p class="battle-tip">💡 이 시안에서 연습한 것 — ${escapeHtml(problem.tip)}</p>`);
        }

        parts.push(`
            <h3 class="battle-result-head">시안과 비교</h3>
            <p class="hint-text">위 "시안 겹쳐보기"를 켜서 내 렌더와 목표 시안을 겹쳐 확인하세요. 색·간격·정렬이 눈으로 맞으면 통과입니다.</p>
        `);

        if (hygiene.empty) {
            parts.push(`<h3 class="battle-result-head">체크리스트</h3><p class="hint-text">CSS를 작성하지 않았습니다.</p>`);
        } else {
            const items = hygiene.checks.map((c) =>
                `<li class="${c.ok ? 'is-ok' : 'is-warn'}"><span class="battle-check-mark">${c.ok ? '✓' : '주의'}</span>
                    <span>${escapeHtml(c.label)}${c.detail ? ` <em>(${escapeHtml(c.detail)})</em>` : ''}</span></li>`).join('');
            parts.push(`
                <h3 class="battle-result-head">체크리스트 (점수 아님 · 셀렉터 습관 점검)</h3>
                <ul class="battle-checklist">${items}</ul>
                <div class="table-scroll">
                    <table class="specificity-table">
                        <thead><tr><th>셀렉터</th><th>ID</th><th>클래스</th><th>태그</th></tr></thead>
                        <tbody>${specRows(hygiene.rules)}</tbody>
                    </table>
                </div>
                <p class="hint-text">ID 칸부터 비교합니다. 낮은 칸이 아무리 많아도 높은 칸 하나를 못 이깁니다.</p>
            `);
        }

        parts.push(`
            <h3 class="battle-result-head">예시 정답 (이대로일 필요는 없어요)</h3>
            <div class="battle-diff">
                <div class="battle-diff-col"><h4>내 CSS</h4><pre>${escapeHtml(el.cssInput.value || '(작성 안 함)')}</pre></div>
                <div class="battle-diff-col"><h4>예시 정답</h4><pre>${escapeHtml(problem.answerCss)}</pre></div>
            </div>
            <p class="hint-text">예시 정답은 컴포넌트 루트(<code>.${escapeHtml(problem.root)}</code>)부터 셀렉터를 잡는 권장 패턴입니다.</p>
        `);

        el.result.innerHTML = parts.join('');
    }

    el.difficultyTabs.addEventListener('click', (e) => {
        const b = e.target.closest('.tabs-btn');
        if (!b || b.dataset.value === difficulty) return;
        difficulty = b.dataset.value;
        setActiveTab(difficulty);
        loadProblem(true);
    });
    el.palette.addEventListener('click', (e) => {
        const sw = e.target.closest('.battle-swatch');
        if (sw) { insertToEditor(sw.dataset.hex); return; }
        if (e.target.closest('[data-role="eyedropper"]')) {
            new window.EyeDropper().open().then((r) => insertToEditor(r.sRGBHex)).catch(() => {});
        }
    });
    el.shield.addEventListener('contextmenu', (e) => e.preventDefault());
    el.overlayToggle.addEventListener('change', syncOverlay);
    el.overlayOpacity.addEventListener('input', syncOverlay);
    el.hintBtn.addEventListener('click', showNextHint);
    el.cssInput.addEventListener('input', updateLivePreview);
    btn.fight.addEventListener('click', startBattle);
    btn.stop.addEventListener('click', () => loadProblem(false));
    btn.done.addEventListener('click', submit);

    setActiveTab(difficulty);
    loadProblem(false);

    return () => stopTimer();
}
