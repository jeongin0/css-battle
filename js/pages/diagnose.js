import { nextChallenge, buildCss, applyFix, REASONS } from '../core/diagnoseChallenges.js';
import { diagnoseCascade, COL_KR, tupleArr, decidingIndex } from '../core/cascadeReplay.js';
import { markQuestDone } from '../store.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function paintSelector(selector) {
    return esc(selector)
        .replace(/(#[\w-]+)/g, '<span class="s-id">$1</span>')
        .replace(/(\.[\w-]+)/g, '<span class="s-class">$1</span>')
        .replace(/(::?[\w-]+)/g, '<span class="s-pseudo">$1</span>');
}

function previewSrc(html, css) {
    return `<!doctype html><html><head><meta charset="utf-8"><style>
        html { font: 14px/1.6 system-ui, "Malgun Gothic", sans-serif; padding: 12px; color: #111; background: #fff; }
        [data-dgx-target] { outline: 2px solid #00B3CC; outline-offset: 2px; }
    </style><style>${css || ''}</style></head><body>${html || ''}</body></html>`;
}

const optionRow = (name, value, text) =>
    `<li><label><input type="radio" name="${name}" value="${value}"><span>${text}</span></label></li>`;

// ---------- 처방 검증 ----------

function verifyFix(doc, ch) {
    if (!doc) return false;
    const win = doc.defaultView;
    const target = doc.querySelector(ch.target);
    if (!target) return false;

    if (ch.type === 'cascade') {
        const probe = doc.createElement('span');
        probe.style.color = ch.rightProbe;
        doc.body.appendChild(probe);
        const want = win.getComputedStyle(probe).color;
        probe.remove();
        return win.getComputedStyle(target)[ch.prop] === want;
    }

    const v = ch.verify;
    const r = target.getBoundingClientRect();

    if (v.kind === 'onTop') {
        const other = doc.querySelector(v.overlapWith);
        if (!other) return false;
        const o = other.getBoundingClientRect();
        const x = Math.round((Math.max(r.left, o.left) + Math.min(r.right, o.right)) / 2);
        const y = Math.round((Math.max(r.top, o.top) + Math.min(r.bottom, o.bottom)) / 2);
        const hit = doc.elementFromPoint(x, y);
        return !!hit && (hit === target || target.contains(hit));
    }
    if (v.kind === 'insideParent') {
        const p = doc.querySelector(v.parent);
        if (!p) return false;
        const pr = p.getBoundingClientRect();
        return Math.abs(r.top - pr.top) < 16 && Math.abs(r.right - pr.right) < 16;
    }
    if (v.kind === 'notClipped') {
        const cx = Math.round(r.left + r.width / 2);
        const cy = Math.round(r.top + r.height / 2);
        const hit = doc.elementFromPoint(cx, cy);
        if (!hit || !(hit === target || target.contains(hit))) return false;
        if (v.below) {
            const b = doc.querySelector(v.below);
            if (b && r.top < b.getBoundingClientRect().bottom - 4) return false;
        }
        return true;
    }
    if (v.kind === 'gap') {
        const p = doc.querySelector(v.parent);
        if (!p) return false;
        return (r.top - p.getBoundingClientRect().top) >= (v.min || 20);
    }
    if (v.kind === 'hasHeight') {
        return r.height >= (v.min || 15) && r.height <= (v.max || 400);
    }
    if (v.kind === 'boxSize') {
        const tol = v.tol || 6;
        return Math.abs(r.width - v.w) <= tol && Math.abs(r.height - v.h) <= tol;
    }
    return false;
}

export function render(container) {
    let challenge = nextChallenge();
    let phase = 'answering';
    let pick = { winner: null, reason: null, cause: null, fix: null };
    let solved = 0;
    let attempts = 0;
    let correctDiag = 0;
    let combo = 0;
    let bestCombo = 0;
    let questMarked = false;

    const SET_SIZE = 3;
    let setPos = 0;
    let setDone = false;

    const ac = new AbortController();
    const listen = (t, type, fn) => t.addEventListener(type, fn, { signal: ac.signal });

    container.innerHTML = `
        <section class="container diagnose-page">
            <h2 class="page-title">CSS 디버그</h2>
            <p class="page-desc">"분명 스타일 줬는데 왜 안 먹히지?" — 원인을 스스로 찾고, <strong>!important 없이 최소 수정</strong>으로 고치세요.</p>

            <div class="dgc-intro">
                <p class="dgc-intro-lead">실무에서 남의 CSS를 유지보수할 때는 늘 이 순서입니다.</p>
                <ol class="dgc-flow">
                    <li><span>1</span> 이 요소는 이렇게 보여야 하는데</li>
                    <li><span>2</span> 스타일을 줬는데도 안 먹힌다</li>
                    <li><span>3</span> 왜 안 먹히나 — <b>원인 찾기</b></li>
                    <li><span>4</span> !important 없이 가장 작게 고친다 — <b>해결</b></li>
                </ol>
                <p class="dgc-intro-why">개발자도구는 "무엇이 이겼나"까지만 답해줍니다. 원인을 짚고 최소 수정을 고르는 건 스스로 해야 하고, 그게 안 되면 결국 <code>!important</code>로 덮게 됩니다. 이 모드는 그 감각을 반복해서 기르기 위한 것입니다.</p>
            </div>

            <dl class="dgc-stats">
                <div><dt>이번 세트</dt><dd data-role="setpos">1 / 3</dd></div>
                <div><dt>해결</dt><dd data-role="solved">0</dd></div>
                <div><dt>진단 정확도</dt><dd data-role="acc">–</dd></div>
                <div><dt>콤보</dt><dd data-role="combo">0</dd></div>
            </dl>

            <div class="dgc-stage">
                <div class="dgc-problem card">
                    <p class="dgc-symptom" data-role="symptom"></p>
                    <div class="dgc-frames">
                        <figure>
                            <figcaption>지금 (버그)</figcaption>
                            <iframe class="dgc-frame" data-role="frame-now" sandbox="allow-same-origin" title="현재 상태"></iframe>
                        </figure>
                        <figure data-role="after-wrap" hidden>
                            <figcaption data-role="after-cap">수정 후</figcaption>
                            <iframe class="dgc-frame" data-role="frame-after" sandbox="allow-same-origin" title="수정 후"></iframe>
                        </figure>
                    </div>
                    <h3 class="battle-panel-title">HTML 구조</h3>
                    <pre class="dom-tree" data-role="html"></pre>
                    <h3 class="battle-panel-title">CSS</h3>
                    <ol class="dgc-css" data-role="css"></ol>
                </div>

                <div class="dgc-quiz card" data-role="quiz"></div>
            </div>

            <div class="dgc-result" data-role="result" hidden></div>

            <iframe class="dgc-offscreen" data-role="frame-sim" sandbox="allow-same-origin" title="" aria-hidden="true"></iframe>
        </section>
    `;

    const q = (s) => container.querySelector(s);
    const el = {
        symptom: q('[data-role="symptom"]'),
        html: q('[data-role="html"]'),
        css: q('[data-role="css"]'),
        quiz: q('[data-role="quiz"]'),
        result: q('[data-role="result"]'),
        frameNow: q('[data-role="frame-now"]'),
        frameAfter: q('[data-role="frame-after"]'),
        afterWrap: q('[data-role="after-wrap"]'),
        afterCap: q('[data-role="after-cap"]'),
        frameSim: q('[data-role="frame-sim"]'),
        solved: q('[data-role="solved"]'),
        acc: q('[data-role="acc"]'),
        combo: q('[data-role="combo"]'),
        setpos: q('[data-role="setpos"]')
    };
    const submitBtn = () => q('[data-role="submit"]');

    function markTarget(frame) {
        const doc = frame.contentDocument;
        const t = doc && doc.querySelector(challenge.target);
        if (t) t.setAttribute('data-dgx-target', '');
    }
    listen(el.frameNow, 'load', () => markTarget(el.frameNow));
    listen(el.frameAfter, 'load', () => markTarget(el.frameAfter));

    function buildQuiz() {
        const fixList = `<ul class="dgc-opts" data-role="q-fix">${challenge.fixes.map((f, i) => optionRow('fix', i, esc(f.label))).join('')}</ul>`;
        let step1;
        if (challenge.type === 'behavior') {
            step1 = `
                <div class="dgc-step">
                    <h3>1단계 · 원인</h3>
                    <p class="dgc-q">이 속성은 분명히 적용됐는데, <b>왜</b> 효과가 안 날까요?</p>
                    <ul class="dgc-opts" data-role="q-cause">${challenge.causes.map((c, i) => optionRow('cause', i, esc(c.text))).join('')}</ul>
                </div>`;
        } else {
            step1 = `
                <div class="dgc-step">
                    <h3>1단계 · 진단</h3>
                    <p class="dgc-q">지금 대상에 <b>${esc(challenge.prop)}: ${esc(challenge.wrong)}</b> 을(를) 적용하는 규칙은?</p>
                    <ul class="dgc-opts" data-role="q-winner">${challenge.rules.map((r, i) => optionRow('winner', i, `<code>${esc(r.sel)}</code>`)).join('')}</ul>
                    <p class="dgc-q">그 규칙이 이기는 이유는?</p>
                    <ul class="dgc-opts" data-role="q-reason">${REASONS.map((rs) => optionRow('reason', rs.id, esc(rs.label))).join('')}</ul>
                </div>`;
        }
        el.quiz.innerHTML = `
            ${step1}
            <div class="dgc-step">
                <h3>2단계 · 처방</h3>
                <p class="dgc-q">가장 <b>올바른 수정</b>은? (효과가 나야 하고, 부작용·!important 가 없어야 함)</p>
                ${fixList}
            </div>
            <button type="button" class="btn" data-role="submit" disabled>제출</button>`;
    }

    function loadChallenge() {
        if (setDone) { setPos = 0; setDone = false; }
        phase = 'answering';
        pick = { winner: null, reason: null, cause: null, fix: null };
        challenge = nextChallenge();
        el.setpos.textContent = `${setPos + 1} / ${SET_SIZE}`;

        el.symptom.innerHTML = `${esc(challenge.symptom)} <span class="dgc-symptom-tag">대상 <code>${esc(challenge.target)}</code></span>`;
        el.html.textContent = challenge.html;
        el.css.innerHTML = challenge.rules.map((r, i) => `
            <li data-idx="${i}">
                <span class="dgc-ln">${i + 1}</span>
                <span class="dgc-rule">${paintSelector(r.sel)} <span class="s-brace">{</span> ${esc(r.decl)}; <span class="s-brace">}</span></span>
            </li>`).join('');

        buildQuiz();

        el.result.hidden = true;
        el.result.innerHTML = '';
        el.afterWrap.hidden = true;
        if (submitBtn()) submitBtn().blur();
        el.frameNow.srcdoc = previewSrc(challenge.html, buildCss(challenge.rules));
    }

    function pickComplete() {
        if (challenge.type === 'behavior') return pick.cause !== null && pick.fix !== null;
        return pick.winner !== null && pick.reason !== null && pick.fix !== null;
    }

    listen(container, 'change', (e) => {
        const input = e.target.closest('input[type="radio"]');
        if (!input || phase !== 'answering') return;
        if (input.name === 'winner') pick.winner = Number(input.value);
        if (input.name === 'reason') pick.reason = input.value;
        if (input.name === 'cause') pick.cause = Number(input.value);
        if (input.name === 'fix') pick.fix = Number(input.value);
        if (submitBtn()) submitBtn().disabled = !pickComplete();
    });

    listen(container, 'click', (e) => {
        if (!e.target.closest('[data-role="submit"]')) return;
        if (phase === 'revealed') { loadChallenge(); return; }
        if (phase === 'answering' && pickComplete()) reveal();
    });

    function simulateFix(fixOp) {
        return new Promise((resolve) => {
            const css = buildCss(applyFix(challenge.rules, fixOp));
            el.frameSim.addEventListener('load', function once() {
                el.frameSim.removeEventListener('load', once);
                resolve(verifyFix(el.frameSim.contentDocument, challenge));
            });
            el.frameSim.srcdoc = previewSrc(challenge.html, css);
        });
    }

    function markOpts(list, isCorrect, chosenIdx) {
        if (!list) return;
        [...list.querySelectorAll('li')].forEach((li, i) => {
            li.querySelector('input').disabled = true;
            if (isCorrect(i)) li.classList.add('is-correct');
            if (i === chosenIdx) {
                li.classList.add('is-chosen');
                if (!isCorrect(i)) li.classList.add('is-wrong');
            }
        });
    }

    async function reveal() {
        phase = 'revealed';
        attempts += 1;
        const isBehavior = challenge.type === 'behavior';

        const chosenFix = challenge.fixes[pick.fix];
        const bestFix = challenge.fixes.find((f) => f.kind === 'best');
        const fixWorks = await simulateFix(chosenFix.op);

        const diagOk = isBehavior
            ? !!(challenge.causes[pick.cause] && challenge.causes[pick.cause].correct)
            : (pick.winner === challenge.answerWinner && pick.reason === challenge.answerReason);
        if (diagOk) correctDiag += 1;

        if (diagOk && chosenFix.kind === 'best') {
            combo += 1;
            bestCombo = Math.max(bestCombo, combo);
        } else {
            combo = 0;
        }
        solved += 1;
        setPos += 1;
        setDone = setPos >= SET_SIZE;
        if (!questMarked) { markQuestDone('diagnose_use'); questMarked = true; }

        // 퀴즈 채점 표시
        if (isBehavior) {
            markOpts(q('[data-role="q-cause"]'), (i) => challenge.causes[i].correct, pick.cause);
        } else {
            markOpts(q('[data-role="q-winner"]'), (i) => i === challenge.answerWinner, pick.winner);
            markOpts(q('[data-role="q-reason"]'), (i) => REASONS[i].id === challenge.answerReason,
                REASONS.findIndex((r) => r.id === pick.reason));
        }
        markOpts(q('[data-role="q-fix"]'), (i) => challenge.fixes[i].kind === 'best', pick.fix);
        q('[data-role="q-fix"]').querySelectorAll('li').forEach((li, i) => {
            if (challenge.fixes[i].kind === 'nope') li.classList.add('is-wrong');
        });

        // CSS 리스트 강조
        if (isBehavior) {
            const li = el.css.querySelector(`li[data-idx="${bestFix.op.ruleIdx}"]`);
            if (li) li.classList.add('is-winner');
        } else {
            el.css.querySelectorAll('li').forEach((li) => {
                li.classList.add(Number(li.dataset.idx) === challenge.answerWinner ? 'is-winner' : 'is-loser');
            });
        }

        const showFix = fixWorks ? chosenFix : bestFix;
        el.afterCap.textContent = fixWorks ? '수정 후 (내 처방)' : '수정 후 (정답 처방)';
        el.frameAfter.srcdoc = previewSrc(challenge.html, buildCss(applyFix(challenge.rules, showFix.op)));
        el.afterWrap.hidden = false;

        let dx = null;
        if (!isBehavior) {
            const doc = el.frameNow.contentDocument;
            const t = doc && doc.querySelector(challenge.target);
            dx = t ? diagnoseCascade(buildCss(challenge.rules), { el: t, root: doc }) : null;
        }

        renderResult(el.result, { challenge, pick, dx, chosenFix, bestFix, fixWorks });
        el.result.hidden = false;
        submitBtn().textContent = setDone ? '새 문제 3개 받기 ▶' : '다음 문제 ▶';
        submitBtn().disabled = false;
        submitBtn().blur();

        el.solved.textContent = solved;
        el.acc.textContent = attempts ? `${Math.round((correctDiag / attempts) * 100)}%` : '–';
        el.combo.textContent = combo;
    }

    loadChallenge();
    return () => ac.abort();
}

// ---------- 고정 참고 (개념별) ----------

const REF_SPECIFICITY = `
    <h3>CSS 우선순위 읽는 법</h3>
    <p class="dgc-ref-intro">여러 규칙이 한 요소를 두고 다투면, 브라우저는 <b>3단계</b>로 승자를 정합니다.</p>
    <ol class="dgc-ref-steps">
        <li><b>1단계 · 어디에 썼나</b><span>인라인 <code>style="…"</code> &gt; <code>&lt;style&gt;</code>·외부 CSS. 선언에 <code>!important</code> 를 붙이면 아래 2·3단계를 건너뛰고 맨 위로 갑니다.</span></li>
        <li><b>2단계 · 얼마나 좁게 겨눴나 (명시도)</b><span>셀렉터를 세 칸으로 셉니다 — <b>ID / 클래스·의사클래스·[속성] / 태그·의사요소</b>. <b>ID 칸부터</b> 비교하고, 낮은 칸은 아무리 많아도 높은 칸 하나를 못 이깁니다.</span></li>
        <li><b>3단계 · 누가 나중에 왔나</b><span>1·2단계가 같으면 CSS에서 <b>더 아래에 쓴</b> 규칙이 이깁니다.</span></li>
    </ol>
    <table class="dgc-ref-table">
        <thead><tr><th>셀렉터</th><th>ID</th><th>클래스</th><th>태그</th></tr></thead>
        <tbody>
            <tr><td><code>p</code></td><td>0</td><td>0</td><td>1</td></tr>
            <tr><td><code>.price</code></td><td>0</td><td>1</td><td>0</td></tr>
            <tr><td><code>a:hover</code> <span class="dgc-ref-note">:hover = 의사클래스</span></td><td>0</td><td>1</td><td>1</td></tr>
            <tr><td><code>#cart .list .price</code></td><td>1</td><td>2</td><td>0</td></tr>
        </tbody>
    </table>
    <dl class="dgc-ref-list">
        <dt>자주 헷갈리는 것</dt>
        <dd><code>!important</code> 는 점수를 올리는 게 아니라 <b>다른 층</b> · <code>*</code> <code>:where()</code> 는 0 · <code>:not(.x)</code> 는 괄호 안만큼 · 셀렉터가 길다고 센 게 아님</dd>
        <dt>안 먹힐 때 고치는 순서</dt>
        <dd>1. 이기는 규칙과 <b>같은 스코프로 좁힌다</b>(조상 셀렉터 추가) → 2. 클래스를 하나 더 → 3. 소스 순서 조정 → 4. <code>!important</code> 는 마지막</dd>
    </dl>`;

const REF_STACKING = `
    <h3>쌓임 맥락 (stacking context)</h3>
    <p class="dgc-ref-intro"><code>z-index</code> 는 형제끼리가 아니라 <b>같은 쌓임 맥락 안에서만</b> 순서를 매깁니다.</p>
    <dl class="dgc-ref-list">
        <dt>새 쌓임 맥락이 생기는 경우</dt>
        <dd>루트 · <code>position</code> + <code>z-index</code>(auto 아님) · <code>transform</code> · <code>opacity</code> &lt; 1 · <code>filter</code> · <code>will-change</code> · <code>isolation: isolate</code> · flex/grid 자식 + z-index</dd>
        <dt>핵심</dt>
        <dd>어떤 요소가 쌓임 맥락이 되면 <b>자손의 z-index 는 전부 그 안에 갇힙니다</b>. 바깥 요소와는 <b>맥락을 만든 요소 자체</b>의 z-index 로 겨룹니다.</dd>
        <dt>고칠 때</dt>
        <dd>1. 맥락을 만드는 속성(대개 <code>transform</code>)을 없앤다 → 2. 못 없애면 <b>맥락을 만든 요소 자체</b>의 z-index 를 올린다 → 3. 자식 z-index 만 올리는 건 소용없다</dd>
    </dl>
    <div class="dgc-ref-example">
        <p>이 <code>.badge</code> 는 999 여도 <code>.card</code> 안에 갇힘:</p>
        <pre>.card  { transform: translateZ(0); }  /* ← 맥락 생성 */
.badge { z-index: 999; }              /* .card 안에서만 999 */
.next  { z-index: 1; }                /* .card 전체를 이김 */</pre>
    </div>`;

const REF_CONTAINING = `
    <h3>컨테이닝 블록 (기준 상자)</h3>
    <p class="dgc-ref-intro"><code>position: absolute</code>/<code>fixed</code> 요소의 <code>top/right/bottom/left</code> 는 <b>어떤 상자</b>를 기준으로 하는지가 정해져 있습니다.</p>
    <dl class="dgc-ref-list">
        <dt>absolute 의 기준</dt>
        <dd><b>가장 가까운 "위치가 지정된" 조상</b> — <code>position</code> 이 <code>static</code> 이 아닌(relative/absolute/fixed/sticky) 조상. 없으면 계속 올라가 <b>뷰포트</b>.</dd>
        <dt>fixed 의 기준</dt>
        <dd>항상 뷰포트. 단, 조상에 <code>transform</code>·<code>filter</code>·<code>will-change</code> 가 있으면 그 조상.</dd>
        <dt>고칠 때</dt>
        <dd>기준으로 삼고 싶은 조상에 <code>position: relative</code> 한 줄. 레이아웃은 그대로.</dd>
    </dl>
    <div class="dgc-ref-example">
        <pre>.modal { /* position 없음 */ }
.close { position: absolute; top: 8px; right: 8px; }
/* → .close 는 .modal 이 아니라 화면 구석에 붙음 */
.modal { position: relative; }  /* ← 이 한 줄로 해결 */</pre>
    </div>`;

const REF_OVERFLOW = `
    <h3>overflow 클리핑</h3>
    <p class="dgc-ref-intro"><code>overflow</code> 가 <code>visible</code> 이 아니면(hidden/auto/scroll/clip), 그 박스를 <b>넘어가는 자손을 전부 자릅니다</b> — absolute 로 띄운 자식도 포함.</p>
    <dl class="dgc-ref-list">
        <dt>자주 겪는 상황</dt>
        <dd>라운드 모서리(<code>border-radius</code> + <code>overflow: hidden</code>) 안에 만든 드롭다운·툴팁·포커스 링이 잘림.</dd>
        <dt>고칠 때</dt>
        <dd>1. 그 자리에서 <code>overflow: hidden</code> 을 뺀다(정말 잘라야 할 콘텐츠에만) → 2. 튀어나올 요소를 그 조상 <b>밖으로</b> 옮긴다(포털) → 3. 흐름 요소로 바꿔 자리를 차지하게 한다</dd>
    </dl>`;

const REF_COLLAPSE = `
    <h3>마진 상쇄 (margin collapse)</h3>
    <p class="dgc-ref-intro">세로 방향 마진은 종종 <b>합쳐집니다</b> — 두 마진 중 큰 값 하나만 남습니다.</p>
    <dl class="dgc-ref-list">
        <dt>부모–첫자식 상쇄</dt>
        <dd>부모와 첫(또는 마지막) 자식 사이에 <b>테두리·패딩·인라인 콘텐츠</b> 가 없으면, 자식의 위쪽 마진이 부모 밖으로 새어나갑니다.</dd>
        <dt>형제끼리 상쇄</dt>
        <dd>위 요소의 <code>margin-bottom</code> 과 아래 요소의 <code>margin-top</code> 이 합쳐집니다.</dd>
        <dt>막는 법</dt>
        <dd>부모에 <code>display: flow-root</code>(부작용 없음) · <code>overflow: hidden</code> · <code>padding</code>/<code>border</code> · flex/grid 컨테이너</dd>
    </dl>`;

const REF_PCTHEIGHT = `
    <h3>퍼센트 높이</h3>
    <p class="dgc-ref-intro"><code>height: 100%</code> 는 "부모 높이의 100%" — <b>부모 높이가 정해져 있어야</b> 계산됩니다.</p>
    <dl class="dgc-ref-list">
        <dt>왜 0 이 되나</dt>
        <dd>부모 높이가 <code>auto</code>(콘텐츠에 따라 결정)면 "auto 의 100%"는 계산할 게 없어 <code>0</code>. <code>width</code> 는 부모가 기본으로 꽉 차서 이 문제가 덜합니다.</dd>
        <dt>고칠 때</dt>
        <dd>1. 부모에 <code>height</code> 또는 <code>min-height</code> 명시 → 2. 부모를 flex/grid 로 만들고 자식이 <code>flex: 1</code> → 3. 뷰포트 기준이면 <code>100dvh</code></dd>
        <dt>연쇄 주의</dt>
        <dd><code>html, body { height: 100% }</code> 부터 잡아야 그 아래 <code>%</code> 가 이어집니다.</dd>
    </dl>`;

const REF_OBJECTFIT = `
    <h3>object-fit</h3>
    <p class="dgc-ref-intro"><code>object-fit</code> 은 "이미지가 <b>주어진 상자</b> 안에서 어떻게 맞춰질지" — 상자가 있어야 동작합니다.</p>
    <dl class="dgc-ref-list">
        <dt>동작 조건</dt>
        <dd><code>&lt;img&gt;</code> 에 <code>width</code>·<code>height</code>(또는 <code>aspect-ratio</code>)가 지정돼 원본과 다른 상자가 생겨야, 그 안에서 <code>cover</code>/<code>contain</code> 이 의미를 가집니다.</dd>
        <dt>값</dt>
        <dd><code>cover</code> 상자를 꽉 채우고 넘치는 부분은 잘림 · <code>contain</code> 비율 유지하며 다 보이게 · <code>fill</code>(기본) 비율 무시하고 늘림</dd>
        <dt>고칠 때</dt>
        <dd><code>img { width: 100%; height: 100%; object-fit: cover }</code> + 부모(<code>figure</code> 등)에 원하는 크기.</dd>
    </dl>`;

const REFERENCE = {
    specificity: REF_SPECIFICITY,
    'stacking-context': REF_STACKING,
    'containing-block': REF_CONTAINING,
    'overflow-clip': REF_OVERFLOW,
    'margin-collapse': REF_COLLAPSE,
    'percent-height': REF_PCTHEIGHT,
    'object-fit': REF_OBJECTFIT
};

// ---------- 해설 ----------

function specStr(spec) { return tupleArr(spec).join(','); }

function specCmp(w, r) {
    const a = tupleArr(w.spec);
    const b = tupleArr(r.spec);
    const dec = decidingIndex(w.spec, r.spec);
    const cell = (arr, k) => {
        const cls = dec === k ? 'is-dec' : (dec >= 0 && k > dec ? 'is-off' : '');
        return `<td class="${cls}">${arr[k]}</td>`;
    };
    const line = (rule, arr) => `<tr><td><code>${esc(rule.selector)}</code></td>${cell(arr, 1)}${cell(arr, 2)}${cell(arr, 3)}</tr>`;
    const note = dec === -1
        ? '<p class="dgc-spec-note">→ 세 칸이 모두 같음. 2단계로는 못 가르니 3단계(소스 순서)로.</p>'
        : `<p class="dgc-spec-note">→ <b>${COL_KR[dec]} 칸</b>에서 ${a[dec]} ${a[dec] > b[dec] ? '>' : '<'} ${b[dec]}. 여기서 끝, 오른쪽 칸은 안 봅니다.</p>`;
    return `<table class="dgc-spec-cmp"><tr><th></th><th>ID</th><th>클래스</th><th>태그</th></tr>${line(w, a)}${line(r, b)}</table>${note}`;
}

function answerBlock(label, res, extra = '') {
    return `
        <div class="dgc-ans ${res.ok ? 'is-ok' : 'is-bad'}">
            <div class="dgc-ans-head">
                <span class="dgc-ans-label">${label}</span>
                <span class="dgc-ans-mark">${res.ok ? '내 답: 맞음' : '내 답: 틀림'}</span>
            </div>
            <p class="dgc-ans-body">${res.html}</p>
            ${extra}
        </div>`;
}

function explainWinner(data) {
    const { challenge, pick, dx } = data;
    const ok = pick.winner === challenge.answerWinner;
    const w = dx && dx.winner;
    if (!w) return { ok, html: '' };
    let html = `정답은 <code>${esc(w.selector)}</code> 입니다. `;
    if (dx.decidedAt === 2) {
        html += '이 규칙에만 <code>!important</code> 가 붙어서 명시도를 따질 것도 없이 1단계에서 맨 위로 갑니다.';
    } else if (dx.decidedAt === 4) {
        html += `두 규칙의 명시도가 <code>${specStr(w.spec)}</code> 로 완전히 같아, 3단계로 넘어가 CSS에서 <b>더 아래에 쓴</b> 이 규칙이 이깁니다.`;
    } else if (dx.runnerUp) {
        const dec = decidingIndex(w.spec, dx.runnerUp.spec);
        html += `명시도가 <code>${specStr(w.spec)}</code>, 진 규칙 <code>${esc(dx.runnerUp.selector)}</code> 는 <code>${specStr(dx.runnerUp.spec)}</code> 입니다. <b>${COL_KR[dec]} 칸</b>에서 갈립니다.`;
    }
    if (!ok && dx.runnerUp) {
        html += dx.decidedAt === 2 ? ' 고른 규칙은 <code>!important</code> 가 없어 이 층에 못 올라갑니다.' : ' 고른 규칙은 명시도가 낮아 밀립니다.';
    }
    return { ok, html };
}

function explainReason(data) {
    const { challenge, pick, dx } = data;
    const correct = challenge.answerReason;
    const picked = pick.reason;
    const ok = correct === picked;
    const w = dx && dx.winner;
    let html = '';
    if (correct === 'specificity') {
        html = '<b>명시도(2단계) 비교</b>가 정답입니다. ';
        if (picked === 'more-classes') html += '"클래스를 더 써서"는 흔한 오해입니다 — 클래스는 <b>클래스 칸에만</b> 쌓이고, 이 문제는 그보다 왼쪽 칸에서 이미 갈렸습니다.';
        else if (picked === 'source-order') html += '두 규칙의 명시도가 서로 달라서 3단계(소스 순서)까지 가지 않았습니다.';
        else if (picked === 'important') html += '두 규칙 다 <code>!important</code> 가 없으니 1단계는 무관합니다.';
        else html += '왼쪽 칸부터 비교하면 여기서 승부가 납니다.';
    } else if (correct === 'source-order') {
        html = `<b>소스 순서(3단계)</b>가 정답입니다. 두 규칙의 명시도가 <code>${w ? specStr(w.spec) : ''}</code> 로 똑같아서 2단계로는 못 가르고, CSS에서 나중에 온 규칙이 이깁니다. `;
        if (picked === 'specificity' || picked === 'more-classes') html += '칸을 아무리 세도 양쪽이 동점이라 소용없습니다.';
        if (picked === 'important') html += '<code>!important</code> 는 어느 쪽에도 없습니다.';
    } else if (correct === 'important') {
        const loser = dx && dx.rules.find((x) => !x.important && x !== w);
        html = `<b>!important (1단계)</b>가 정답입니다. 이기는 규칙에 <code>!important</code> 가 붙어서 명시도를 아예 안 봅니다 — <code>${loser ? esc(loser.selector) : '상대 규칙'}</code>(${loser ? specStr(loser.spec) : ''}) 가 명시도로는 더 높은데도 집니다. `;
        if (picked === 'specificity' || picked === 'more-classes') html += '<code>!important</code> 는 명시도 점수가 아니라 그 <b>위의 층</b>입니다.';
    }
    return { ok, html };
}

function fixVerdictLine(chosenFix, bestFix, fixWorks) {
    void fixWorks;
    if (chosenFix.kind === 'best') return '(고른 것도 정답)';
    if (chosenFix.kind === 'nope') {
        return /!important/.test(chosenFix.label)
            ? `고른 <code>!important</code> 는 이 문제에 소용없습니다 — 값이 <b>무시</b>되는 게 아니라 맥락·기준·상자 때문이라서요.`
            : `고른 수정은 적용해도 <b>효과가 없습니다</b>.`;
    }
    return `고른 것도 되지만 부작용이 있습니다. 더 나은 건 <b>${esc(bestFix.label)}</b>.`;
}

function cascadeAnswer(data) {
    const { challenge, dx, chosenFix, bestFix, fixWorks } = data;
    const wRes = explainWinner(data);
    const rRes = explainReason(data);
    const bop = bestFix.op.op;
    let fixHtml = `정답 처방은 <b>${esc(bestFix.label)}</b> 입니다. `;
    if (bop === 'selector' || bop === 'prefix') fixHtml += '이기는 규칙과 같은 스코프로 좁히면 명시도가 그 위로 올라갑니다. ';
    else if (bop === 'move-last') fixHtml += '명시도가 동점이니 순서만 뒤로 옮기면 이깁니다. ';
    else if (bop === 'drop-important') fixHtml += '이기고 있는 <code>!important</code> 만 지우면 명시도 규칙이 정상 작동합니다. ';
    fixHtml += fixVerdictLine(chosenFix, bestFix, fixWorks);
    const cmp = dx && dx.winner && dx.runnerUp ? specCmp(dx.winner, dx.runnerUp) : '';
    void challenge;
    return answerBlock('이기는 규칙', wRes)
        + answerBlock('이기는 이유', rRes, cmp)
        + answerBlock('처방', { ok: chosenFix.kind === 'best', html: fixHtml });
}

function behaviorAnswer(data) {
    const { challenge, pick, chosenFix, bestFix, fixWorks } = data;
    const correctCause = challenge.causes.find((c) => c.correct);
    const causeOk = !!(challenge.causes[pick.cause] && challenge.causes[pick.cause].correct);
    const causeRes = { ok: causeOk, html: `<b>원인:</b> ${esc(correctCause.text)}<br>${challenge.teach.cause}` };
    const fixRes = {
        ok: chosenFix.kind === 'best',
        html: `${challenge.teach.fix} ${fixVerdictLine(chosenFix, bestFix, fixWorks)}`
    };
    return answerBlock('원인', causeRes) + answerBlock('처방', fixRes);
}

function renderResult(root, data) {
    const { challenge } = data;
    const ref = REFERENCE[challenge.concept] || REF_SPECIFICITY;
    const my = challenge.type === 'behavior' ? behaviorAnswer(data) : cascadeAnswer(data);
    root.innerHTML = `
        <div class="dgc-teach-grid">
            <aside class="card dgc-ref">${ref}</aside>
            <div class="card dgc-mypick">
                <h3>이번 문제 해설</h3>
                ${my}
            </div>
        </div>`;
}
