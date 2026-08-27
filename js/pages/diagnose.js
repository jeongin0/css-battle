import { rankRules } from '../core/cascade.js';
import { attachCodeEditor } from '../components/cssEditor.js';
import { markQuestDone } from '../store.js';

const SAMPLE_CSS = `.card p { color: #333; }
#main .card p.lead { color: #0a7; }
.card p { color: tomato !important; }
article p { color: blue; }`;

export function render(container) {
    container.innerHTML = `
        <section class="container diagnose-page">
            <h2 class="page-title">실전 진단 모드</h2>
            <p class="page-desc">실제 CSS 코드를 붙여넣고, 대상 엘리먼트에 어떤 규칙이 이기는지 우선순위를 진단합니다.</p>

            <h3 class="battle-panel-title">CSS 코드</h3>
            <textarea class="css-editor" data-role="css" spellcheck="false"></textarea>

            <div class="diagnose-target">
                <label>태그 <input type="text" data-role="tag" placeholder="p"></label>
                <label>클래스 <input type="text" data-role="class" placeholder="lead card (공백 구분)"></label>
                <label>ID <input type="text" data-role="id" placeholder="main-title"></label>
            </div>

            <button type="button" class="btn" data-role="run">진단하기</button>

            <div data-role="result"></div>
            <p class="hint-text">근사 계산이며 실제 브라우저와 다를 수 있습니다. (@media·상속·복합 조합자는 단순화)</p>
        </section>
    `;

    const cssEl = container.querySelector('[data-role="css"]');
    const tagEl = container.querySelector('[data-role="tag"]');
    const classEl = container.querySelector('[data-role="class"]');
    const idEl = container.querySelector('[data-role="id"]');
    const resultEl = container.querySelector('[data-role="result"]');

    cssEl.value = SAMPLE_CSS;
    attachCodeEditor(cssEl);

    container.querySelector('[data-role="run"]').addEventListener('click', () => {
        const target = {
            tag: tagEl.value.trim() || null,
            id: idEl.value.trim().replace('#', '') || null,
            classes: classEl.value.trim().split(/\s+/).filter(Boolean).map((c) => c.replace('.', ''))
        };
        if (!target.tag && !target.id && !target.classes.length) {
            resultEl.innerHTML = `<p class="result-badge result-badge-lose">대상 엘리먼트 조건을 하나 이상 입력하세요.</p>`;
            return;
        }

        const ranked = rankRules(cssEl.value, target);
        markQuestDone('diagnose_use');

        if (!ranked.length) {
            resultEl.innerHTML = `<p class="result-badge result-badge-lose">대상과 매칭되는 규칙을 찾지 못했습니다.</p>`;
            return;
        }

        resultEl.innerHTML = `
            <div class="table-scroll">
                <table class="specificity-table diagnose-table">
                    <thead>
                        <tr><th>순위</th><th>셀렉터</th><th>특이도</th><th>!important</th><th>사유</th></tr>
                    </thead>
                    <tbody>
                        ${ranked.map((r) => `
                            <tr class="${r.isWinner ? 'is-winner' : ''}">
                                <td>${r.rank}</td>
                                <td><code>${r.selector}</code></td>
                                <td>${r.spec.inline},${r.spec.id},${r.spec.class},${r.spec.tag}</td>
                                <td>${r.spec.important ? 'O' : '-'}</td>
                                <td>${r.reason}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
}
