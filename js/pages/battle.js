import { previewDoc, nextBattleProblem, obfuscatedShown } from '../core/battleProblems.js';
import { scoreAccuracy, scorePrecision } from '../core/battleScore.js';
import { calculateSpecificity } from '../core/specificity.js';
import { attachCodeEditor } from '../components/cssEditor.js';
import { addBattleRecord } from '../store.js';

export function render(container) {
    let difficulty = 'low';
    let phase = 'idle';
    let problem = nextBattleProblem(difficulty);
    let timerId = null;
    let elapsed = 0;
    let lastResult = null;

    container.innerHTML = `
        <section class="container battle-page">
            <h2 class="page-title">배틀 모드</h2>
            <p class="page-desc">HTML과 목표 시안만 보고 CSS를 직접 작성해, 시안과 똑같이 만드세요. 시안과의 배틀입니다.</p>

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

            <p class="hint-text">FIGHT를 누르면 스톱워치가 흐르고 에디터가 열립니다. 정확도 90% 이상이면 클리어이며, 실패는 없습니다.</p>
            <div class="battle-status" data-role="status"></div>
            <p class="battle-toast" data-role="toast" hidden></p>

            <div class="battle-layout">
                <div class="battle-col">
                    <h3 class="battle-panel-title">HTML 구조 (수정 불가)</h3>
                    <pre class="dom-tree" data-role="html-src"></pre>

                    <h3 class="battle-panel-title">목표 시안 <span data-role="problem-name"></span></h3>
                    <div class="battle-shielded">
                        <iframe class="preview-frame preview-frame-lg" data-role="shown-frame" sandbox="allow-same-origin" scrolling="no" title="목표 시안"></iframe>
                        <div class="battle-shield" data-role="shield"></div>
                    </div>

                    <h3 class="battle-panel-title">색상 팔레트 · 스포이드</h3>
                    <div class="battle-palette" data-role="palette"></div>
                </div>

                <div class="battle-col">
                    <h3 class="battle-panel-title">현재 렌더링 (실시간)</h3>
                    <iframe class="preview-frame preview-frame-lg" data-role="live-frame" sandbox="allow-same-origin" title="현재 렌더링"></iframe>

                    <h3 class="battle-panel-title">CSS 작성</h3>
                    <textarea class="css-editor" data-role="css-input" spellcheck="false" placeholder="FIGHT를 누르면 입력할 수 있습니다"></textarea>
                </div>
            </div>

            <div class="battle-result" data-role="result"></div>
            <div class="battle-actions" data-role="result-actions" hidden>
                <button type="button" class="btn btn-ghost" data-role="save-btn">전적에 저장</button>
            </div>

            <iframe class="battle-offscreen" data-role="answer-frame" sandbox="allow-same-origin" title="채점용 렌더" aria-hidden="true" tabindex="-1"></iframe>
            <iframe class="battle-offscreen" data-role="base-frame" sandbox="allow-same-origin" title="채점용 렌더" aria-hidden="true" tabindex="-1"></iframe>
        </section>
    `;

    const el = {
        answerFrame: container.querySelector('[data-role="answer-frame"]'),
        shownFrame: container.querySelector('[data-role="shown-frame"]'),
        liveFrame: container.querySelector('[data-role="live-frame"]'),
        baseFrame: container.querySelector('[data-role="base-frame"]'),
        shield: container.querySelector('[data-role="shield"]'),
        htmlSrc: container.querySelector('[data-role="html-src"]'),
        palette: container.querySelector('[data-role="palette"]'),
        cssInput: container.querySelector('[data-role="css-input"]'),
        result: container.querySelector('[data-role="result"]'),
        resultActions: container.querySelector('[data-role="result-actions"]'),
        status: container.querySelector('[data-role="status"]'),
        toast: container.querySelector('[data-role="toast"]'),
        problemName: container.querySelector('[data-role="problem-name"]'),
        difficultyTabs: container.querySelector('[data-role="difficulty-tabs"]')
    };
    const btn = {
        fight: container.querySelector('[data-role="fight-btn"]'),
        stop: container.querySelector('[data-role="stop-btn"]'),
        done: container.querySelector('[data-role="done-btn"]'),
        save: container.querySelector('[data-role="save-btn"]')
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
        const idle = phase === 'idle';
        const running = phase === 'running';
        const result = phase === 'result';
        btn.fight.textContent = result ? '다음 문제 ▶' : 'FIGHT';
        btn.fight.disabled = running;
        btn.stop.disabled = !running;
        btn.done.disabled = !running;
        el.cssInput.disabled = !running;
        el.difficultyTabs.classList.toggle('is-locked', !idle);
        el.resultActions.hidden = !(result && lastResult);
        if (result) { btn.save.disabled = false; btn.save.textContent = '전적에 저장'; }
        renderStatus();
    }

    function loadProblem(pickNew) {
        stopTimer();
        if (pickNew) problem = nextBattleProblem(difficulty);
        elapsed = 0;
        lastResult = null;
        el.problemName.textContent = `— ${problem.name}`;
        el.htmlSrc.textContent = problem.html;
        el.answerFrame.srcdoc = previewDoc(problem.html, problem.answerCss);
        el.shownFrame.srcdoc = obfuscatedShown(problem);
        el.baseFrame.srcdoc = previewDoc(problem.html, '');
        el.cssInput.value = '';
        el.result.innerHTML = '';
        renderPalette();
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

    function ruleRows() {
        const { rules } = scorePrecision(el.cssInput.value, el.liveFrame.contentDocument, problem.root);
        return rules.map((r) => {
            const s = calculateSpecificity(r.selector);
            return `<tr><td><code>${escapeHtml(r.selector)}</code></td><td>${s.inline}</td><td>${s.id}</td><td>${s.class}</td><td>${s.tag}</td></tr>`;
        }).join('');
    }

    function submit() {
        const userDoc = el.liveFrame.contentDocument;
        const answerDoc = el.answerFrame.contentDocument;
        const baseDoc = el.baseFrame.contentDocument;
        if (!userDoc || !answerDoc || !baseDoc) {
            el.result.innerHTML = `<p class="result-badge result-badge-lose">미리보기 로딩 중입니다. 잠시 후 완료를 다시 누르세요.</p>`;
            return;
        }
        stopTimer();

        const acc = scoreAccuracy({ userDoc, answerDoc, baseDoc });
        const prec = scorePrecision(el.cssInput.value, userDoc, problem.root);
        const won = acc.cleared;

        lastResult = {
            difficulty,
            problemId: problem.id,
            accuracy: acc.percent,
            precision: prec.score,
            timeSec: elapsed,
            result: won ? 'win' : 'lose'
        };

        setPhase('result');
        renderResult(acc, prec, won);
    }

    function renderResult(acc, prec, won) {
        const parts = [];

        parts.push(won
            ? `<p class="result-badge result-badge-win">클리어</p> <span class="battle-clear-time">${formatTime(elapsed)}</span>`
            : `<p class="result-badge result-badge-lose">아직이에요</p>`);

        parts.push(`
            <dl class="battle-score">
                <div><dt>정확도</dt><dd class="${acc.cleared ? 'is-ok' : 'is-bad'}">${acc.percent}%</dd><span>기준 ${acc.threshold}%</span></div>
                <div><dt>정밀도</dt><dd>${prec.score}점</dd><span>셀렉터 위생</span></div>
            </dl>
        `);

        if (acc.mismatches.length) {
            const lis = acc.mismatches.map((m) =>
                `<li><code>${escapeHtml(m.label)}</code> ${m.prop}: 시안 <b>${escapeHtml(m.expected)}</b> / 내 결과 <b>${escapeHtml(m.actual)}</b></li>`).join('');
            const collapsed = acc.mismatches.length > 14;
            parts.push(`<h3 class="battle-result-head">시안과 다른 부분 (${acc.mismatches.length})</h3>
                <ul class="battle-feedback battle-mismatch${collapsed ? ' is-collapsed' : ''}">${lis}</ul>
                ${collapsed ? `<button type="button" class="btn btn-ghost battle-expand" data-role="expand-mismatch">전체 ${acc.mismatches.length}개 보기</button>` : ''}`);
        }
        if (prec.deductions.length) {
            parts.push(`<h3 class="battle-result-head">정밀도 감점 (-${100 - prec.score})</h3>
                <ul class="battle-feedback">${prec.deductions.map((d) =>
                    `<li>−${d.points} ${d.reason}${d.detail ? ` · <code>${escapeHtml(d.detail)}</code>` : ''}</li>`).join('')}</ul>`);
        }

        parts.push(`
            <h3 class="battle-result-head">내 규칙 특이도</h3>
            <div class="table-scroll">
                <table class="specificity-table">
                    <thead><tr><th>셀렉터</th><th>인라인</th><th>ID</th><th>클래스</th><th>태그</th></tr></thead>
                    <tbody>${ruleRows() || '<tr><td colspan="5">규칙 없음</td></tr>'}</tbody>
                </table>
            </div>
        `);

        parts.push(`
            <h3 class="battle-result-head">예시 정답 (이대로일 필요는 없어요)</h3>
            <div class="battle-diff">
                <div class="battle-diff-col"><h4>내 CSS</h4><pre>${escapeHtml(el.cssInput.value || '(작성 안 함)')}</pre></div>
                <div class="battle-diff-col"><h4>예시 정답</h4><pre>${escapeHtml(problem.answerCss)}</pre></div>
            </div>
            <p class="hint-text">정확도는 요소의 색·테두리·스타일이 시안과 같은지만 봅니다. 크기·위치는 시안에 맞게 구현했다면 정답이에요. 예시 정답은 컴포넌트 루트(<code>.${escapeHtml(problem.root)}</code>)부터 셀렉터를 잡는 권장 패턴입니다.</p>
            <p class="hint-text">"전적에 저장"을 누르면 이 결과가 <a href="#report">리포트</a> 페이지에 통계로 쌓입니다.</p>
        `);

        el.result.innerHTML = parts.join('');
    }

    function onSave() {
        if (!lastResult) return;
        addBattleRecord({
            difficulty: lastResult.difficulty,
            problemId: lastResult.problemId,
            selector: '',
            accuracy: lastResult.accuracy,
            precision: lastResult.precision,
            matchedDesign: lastResult.accuracy >= 90,
            wonSpecificity: lastResult.precision >= 90,
            timeSec: lastResult.timeSec,
            result: lastResult.result
        });
        btn.save.disabled = true;
        btn.save.textContent = '저장됨 · 리포트에서 확인';
    }

    el.difficultyTabs.addEventListener('click', (e) => {
        if (phase !== 'idle') return;
        const b = e.target.closest('.tabs-btn');
        if (!b) return;
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
    el.result.addEventListener('click', (e) => {
        const b = e.target.closest('[data-role="expand-mismatch"]');
        if (!b) return;
        b.previousElementSibling.classList.remove('is-collapsed');
        b.remove();
    });
    el.cssInput.addEventListener('input', updateLivePreview);
    btn.fight.addEventListener('click', startBattle);
    btn.stop.addEventListener('click', () => loadProblem(false));
    btn.done.addEventListener('click', submit);
    btn.save.addEventListener('click', onSave);

    setActiveTab(difficulty);
    loadProblem(false);

    return () => stopTimer();
}
