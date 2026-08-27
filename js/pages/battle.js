import { previewDoc, nextBattleProblem } from '../core/battleProblems.js';
import { scoreAccuracy, scorePrecision, precisionPar } from '../core/battleScore.js';
import { healthBarHtml } from '../components/healthbar.js';
import { calculateSpecificity } from '../core/specificity.js';
import { addBattleRecord } from '../store.js';

const MODE_NOTE = {
    solo: '솔로 · 실패 없이 정확도 90%를 넘길 때까지 도전합니다. 시작~완료 시간이 기록됩니다.',
    ghost: '가상 상대 · "par"는 정답 CSS를 촘촘하게 짰을 때의 정밀도 점수입니다. 클리어 + 내 정밀도가 par에 근접하면 KO.'
};

const GHOST_TOLERANCE = 15;

export function render(container) {
    let difficulty = 'low';
    let mode = 'solo';
    let phase = 'idle';
    let problem = nextBattleProblem(difficulty);
    let par = precisionPar(problem);
    let timerId = null;
    let elapsed = 0;
    let myHp = 100;
    let lastResult = null;

    container.innerHTML = `
        <section class="container battle-page">
            <h1 class="page-title">배틀 모드</h1>
            <p class="page-desc">시안과 HTML만 보고 CSS를 0부터 작성해 똑같이 만드세요. 정확도와 셀렉터 정밀도로 채점됩니다.</p>

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
            <p class="battle-toast" data-role="toast" hidden></p>

            <div class="battle-layout">
                <div class="battle-col">
                    <h2 class="battle-panel-title">목표 시안 <span data-role="problem-name"></span></h2>
                    <iframe class="preview-frame preview-frame-lg" data-role="answer-frame" sandbox="allow-same-origin" title="목표 시안"></iframe>

                    <h2 class="battle-panel-title">색상 팔레트 · 스포이드</h2>
                    <div class="battle-palette" data-role="palette"></div>

                    <h2 class="battle-panel-title">HTML 구조 (수정 불가)</h2>
                    <pre class="dom-tree" data-role="html-src"></pre>
                </div>

                <div class="battle-col">
                    <h2 class="battle-panel-title">CSS 작성</h2>
                    <textarea class="css-editor" data-role="css-input" spellcheck="false" placeholder="FIGHT를 누르면 입력할 수 있습니다"></textarea>

                    <h2 class="battle-panel-title">현재 렌더링 (실시간)</h2>
                    <iframe class="preview-frame preview-frame-lg" data-role="live-frame" sandbox="allow-same-origin" title="현재 렌더링"></iframe>
                </div>
            </div>

            <div class="battle-result" data-role="result"></div>
            <div class="battle-actions" data-role="result-actions" hidden>
                <button type="button" class="btn btn-ghost" data-role="save-btn">전적에 저장</button>
            </div>

            <iframe class="battle-offscreen" data-role="base-frame" sandbox="allow-same-origin" title="" aria-hidden="true"></iframe>
        </section>
    `;

    const el = {
        answerFrame: container.querySelector('[data-role="answer-frame"]'),
        liveFrame: container.querySelector('[data-role="live-frame"]'),
        baseFrame: container.querySelector('[data-role="base-frame"]'),
        htmlSrc: container.querySelector('[data-role="html-src"]'),
        palette: container.querySelector('[data-role="palette"]'),
        cssInput: container.querySelector('[data-role="css-input"]'),
        result: container.querySelector('[data-role="result"]'),
        resultActions: container.querySelector('[data-role="result-actions"]'),
        modeNote: container.querySelector('[data-role="mode-note"]'),
        status: container.querySelector('[data-role="status"]'),
        toast: container.querySelector('[data-role="toast"]'),
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

    function stopTimer() {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }

    function formatTime(sec) {
        return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }

    function renderStatus() {
        if (mode === 'solo') {
            el.status.innerHTML = `<span class="battle-timer">⏱ ${formatTime(elapsed)}</span>`;
        } else {
            el.status.innerHTML = healthBarHtml('내 HP', myHp)
                + `<p class="battle-par">상대 par 정밀도 <strong>${par}</strong> (±${GHOST_TOLERANCE})</p>`;
        }
    }

    function updateLivePreview() {
        el.liveFrame.srcdoc = previewDoc(problem.html, el.cssInput.value);
    }

    function renderPalette() {
        const swatches = problem.palette.map((hex) =>
            `<button type="button" class="battle-swatch" data-hex="${hex}" style="--sw:${hex}" title="${hex}">${hex}</button>`
        ).join('');
        const eyedropper = window.EyeDropper
            ? `<button type="button" class="btn btn-ghost battle-eyedropper" data-role="eyedropper">스포이드</button>`
            : `<span class="hint-text">스포이드는 최신 Chrome/Edge에서 지원됩니다</span>`;
        el.palette.innerHTML = swatches + eyedropper;
    }

    let toastId = null;
    function toast(msg) {
        el.toast.textContent = msg;
        el.toast.hidden = false;
        clearTimeout(toastId);
        toastId = setTimeout(() => { el.toast.hidden = true; }, 1400);
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
        el.modeTabs.classList.toggle('is-locked', !idle);
        el.resultActions.hidden = !(result && lastResult);
        renderStatus();
    }

    function loadProblem(pickNew) {
        stopTimer();
        if (pickNew) problem = nextBattleProblem(difficulty);
        par = precisionPar(problem);
        elapsed = 0;
        myHp = 100;
        lastResult = null;
        el.problemName.textContent = `— ${problem.name}`;
        el.htmlSrc.textContent = problem.html;
        el.answerFrame.srcdoc = previewDoc(problem.html, problem.answerCss);
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
        timerId = setInterval(() => { elapsed += 1; if (mode === 'solo') renderStatus(); }, 1000);
    }

    function setActiveTab(tabsEl, value) {
        tabsEl.querySelectorAll('.tabs-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.value === value));
    }

    function ruleRows(cssText, doc) {
        const { rules } = scorePrecision(cssText, doc);
        return rules.map((r) => {
            const s = calculateSpecificity(r.selector);
            return `<tr><td><code>${r.selector}</code></td><td>${s.inline}</td><td>${s.id}</td><td>${s.class}</td><td>${s.tag}</td></tr>`;
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

        const acc = scoreAccuracy({ userDoc, answerDoc, baseDoc, problem });
        const prec = scorePrecision(el.cssInput.value, userDoc);
        const ghostTarget = Math.max(50, par - GHOST_TOLERANCE);
        const won = mode === 'ghost'
            ? acc.cleared && prec.score >= ghostTarget
            : acc.cleared;

        lastResult = {
            mode, difficulty,
            accuracy: acc.percent,
            precision: prec.score,
            par,
            timeSec: elapsed,
            result: won ? 'win' : 'lose'
        };

        if (mode === 'ghost') {
            if (!acc.cleared) myHp -= 50;
            if (prec.score < ghostTarget) myHp -= 30;
            myHp = Math.max(0, myHp);
        }

        setPhase('result');
        renderResult(acc, prec, won, ghostTarget);
    }

    function renderResult(acc, prec, won, ghostTarget) {
        const parts = [];

        parts.push(won
            ? `<p class="result-badge result-badge-win">클리어</p> ${mode === 'ghost' ? '<span class="ko-stamp">K.O.</span>' : ''} ${mode === 'solo' ? `<span class="battle-clear-time">${formatTime(elapsed)}</span>` : ''}`
            : `<p class="result-badge result-badge-lose">아직이에요</p>`);

        parts.push(`
            <dl class="battle-score">
                <div><dt>정확도</dt><dd class="${acc.cleared ? 'is-ok' : 'is-bad'}">${acc.percent}%</dd><span>기준 ${acc.threshold}%</span></div>
                <div><dt>정밀도</dt><dd>${prec.score}점</dd><span>${mode === 'ghost' ? `par ${par} · 목표 ${ghostTarget}` : 'par ' + par}</span></div>
            </dl>
        `);

        if (acc.mismatches.length) {
            parts.push(`<h3 class="battle-result-head">시안과 다른 부분 (${acc.mismatches.length})</h3>
                <ul class="battle-feedback">${acc.mismatches.slice(0, 12).map((m) =>
                    `<li><code>${m.sel}</code> ${m.prop}: 기대 <b>${m.expected}</b> / 현재 <b>${m.actual}</b></li>`).join('')}
                ${acc.mismatches.length > 12 ? `<li>…외 ${acc.mismatches.length - 12}개</li>` : ''}</ul>`);
        }
        if (acc.leaks.length) {
            parts.push(`<h3 class="battle-result-head">스타일 누수</h3>
                <ul class="battle-feedback">${acc.leaks.map((l) =>
                    `<li><code>${l.sel}</code> ${l.prop} 이(가) 의도치 않게 바뀜 (${l.actual})</li>`).join('')}</ul>`);
        }
        if (prec.deductions.length) {
            parts.push(`<h3 class="battle-result-head">정밀도 감점 (-${100 - prec.score})</h3>
                <ul class="battle-feedback">${prec.deductions.map((d) =>
                    `<li>−${d.points} ${d.reason}${d.detail ? ` · <code>${d.detail}</code>` : ''}</li>`).join('')}</ul>`);
        }

        parts.push(`
            <h3 class="battle-result-head">내 규칙 특이도</h3>
            <div class="table-scroll">
                <table class="specificity-table">
                    <thead><tr><th>셀렉터</th><th>인라인</th><th>ID</th><th>클래스</th><th>태그</th></tr></thead>
                    <tbody>${ruleRows(el.cssInput.value, el.liveFrame.contentDocument) || '<tr><td colspan="5">규칙 없음</td></tr>'}</tbody>
                </table>
            </div>
            <p class="hint-text">정확도는 렌더링 결과(computed style) 근사 비교입니다. 정답은 하나가 아니며, 시안과 같게만 보이면 통과합니다.</p>
        `);

        el.result.innerHTML = parts.join('');
    }

    function onSave() {
        if (!lastResult) return;
        addBattleRecord({
            mode: lastResult.mode,
            difficulty: lastResult.difficulty,
            selector: '',
            accuracy: lastResult.accuracy,
            precision: lastResult.precision,
            par: lastResult.par,
            wonSpecificity: lastResult.precision >= lastResult.par,
            matchedDesign: lastResult.accuracy >= 90,
            timeSec: lastResult.timeSec,
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
        renderStatus();
    });
    el.palette.addEventListener('click', (e) => {
        const sw = e.target.closest('.battle-swatch');
        if (sw) { insertToEditor(sw.dataset.hex); return; }
        if (e.target.closest('[data-role="eyedropper"]')) {
            new window.EyeDropper().open().then((r) => insertToEditor(r.sRGBHex)).catch(() => {});
        }
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
