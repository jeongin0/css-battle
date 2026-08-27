import { getState } from '../store.js';
import { drawBarChart, drawLineChart } from '../components/chart.js';
import { calculateSpecificity } from '../core/specificity.js';

function weekKey(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function groupWinRateByWeek(records) {
    const buckets = new Map();
    for (const r of records) {
        const key = weekKey(r.date);
        const b = buckets.get(key) || { total: 0, win: 0 };
        b.total += 1;
        if (r.result === 'win') b.win += 1;
        buckets.set(key, b);
    }
    return [...buckets.entries()].map(([label, b]) => ({
        label,
        value: Math.round((b.win / b.total) * 100)
    }));
}

const SELECTOR_GUIDE = [
    { type: 'ID', spec: '0,1,0,0', desc: '학생증처럼 유일해서 클래스 여러 개보다 셉니다.' },
    { type: '클래스 / 속성 / 의사클래스', spec: '0,0,1,0', desc: '.card, [type], :hover — 재사용 가능한 중간 무게.' },
    { type: '태그 / 의사요소', spec: '0,0,0,1', desc: 'div, p, ::before — 가장 약해서 쉽게 덮어써집니다.' },
    { type: '인라인 스타일', spec: '1,0,0,0', desc: 'style="" — !important 빼고 가장 셉니다.' }
];

function weakestType(records) {
    const losses = records.filter((r) => r.result === 'lose' && r.selector);
    const tally = { ID: 0, 클래스: 0, 태그: 0 };
    for (const r of losses) {
        const s = calculateSpecificity(r.selector);
        if (s.id) tally.ID += 1;
        else if (s.class) tally.클래스 += 1;
        else tally.태그 += 1;
    }
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    return top && top[1] > 0 ? top[0] : null;
}

export function render(container) {
    const state = getState();
    const battles = state.battleRecords;
    const typings = state.typingRecords;

    const wins = battles.filter((r) => r.result === 'win').length;
    const winRate = battles.length ? Math.round((wins / battles.length) * 100) : 0;
    const learnDays = new Set([...battles, ...typings].map((r) => r.date)).size;

    const weekly = groupWinRateByWeek(battles);
    const firstWeek = weekly[0];
    const lastWeek = weekly[weekly.length - 1];

    container.innerHTML = `
        <section class="container report-page">
            <h2 class="page-title">성장 리포트</h2>

            <div class="tabs" data-role="tabs">
                <button type="button" class="tabs-btn is-active" data-value="report">성장 리포트</button>
                <button type="button" class="tabs-btn" data-value="dex">도감</button>
            </div>

            <div data-role="panel-report" class="report-panel">
                <dl class="report-cards">
                    <div class="card"><dt>총 배틀 수</dt><dd>${battles.length}</dd></div>
                    <div class="card"><dt>현재 승률</dt><dd>${winRate}%</dd></div>
                    <div class="card"><dt>학습 일수</dt><dd>${learnDays}일</dd></div>
                </dl>

                ${battles.length ? '' : '<p class="hint-text">아직 배틀 기록이 없습니다. 배틀 모드에서 "전적에 저장"을 눌러보세요.</p>'}

                <h3 class="battle-panel-title">주차별 승률</h3>
                <canvas class="report-chart" data-role="chart-winrate"></canvas>

                ${firstWeek && lastWeek && weekly.length > 1
                    ? `<p class="report-beforeafter">${firstWeek.label}주 ${firstWeek.value}% → ${lastWeek.label}주 ${lastWeek.value}%</p>`
                    : ''}

                <h3 class="battle-panel-title">타이핑 타수 추이</h3>
                <canvas class="report-chart" data-role="chart-wpm"></canvas>

                <h3 class="battle-panel-title">타이핑 정확도 추이</h3>
                <canvas class="report-chart" data-role="chart-acc"></canvas>
            </div>

            <div data-role="panel-dex" class="report-panel" hidden>
                <ul class="dex-list">
                    ${SELECTOR_GUIDE.map((g) => `
                        <li class="card">
                            <h4 class="card-title">${g.type}</h4>
                            <p class="dex-spec">특이도 ${g.spec}</p>
                            <p>${g.desc}</p>
                        </li>
                    `).join('')}
                </ul>
                <p class="report-insight">
                    ${weakestType(battles)
                        ? `이번까지 기록 기준, <strong>${weakestType(battles)}</strong> 유형으로 진 경우가 가장 많습니다.`
                        : '아직 패배 기록이 부족해 개인화 인사이트를 만들 수 없습니다.'}
                </p>
            </div>
        </section>
    `;

    const tabs = container.querySelector('[data-role="tabs"]');
    const panelReport = container.querySelector('[data-role="panel-report"]');
    const panelDex = container.querySelector('[data-role="panel-dex"]');

    function drawAll() {
        drawBarChart(container.querySelector('[data-role="chart-winrate"]'),
            weekly.length ? weekly : [{ label: '-', value: 0 }], { max: 100, unit: '%' });
        const recentTyping = typings.slice(-8);
        drawLineChart(container.querySelector('[data-role="chart-wpm"]'),
            recentTyping.map((r, i) => ({ label: `${i + 1}`, value: r.wpm })),
            { lineColor: '#FFD23F' });
        drawLineChart(container.querySelector('[data-role="chart-acc"]'),
            recentTyping.map((r, i) => ({ label: `${i + 1}`, value: r.accuracy })),
            { max: 100, lineColor: '#4ADE80' });
    }

    tabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tabs-btn');
        if (!btn) return;
        tabs.querySelectorAll('.tabs-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        const isReport = btn.dataset.value === 'report';
        panelReport.hidden = !isReport;
        panelDex.hidden = isReport;
        if (isReport) drawAll();
    });

    drawAll();
    window.addEventListener('resize', drawAll);
    return () => window.removeEventListener('resize', drawAll);
}
