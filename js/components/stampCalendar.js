// 퀘스트 모드 스탬프 달력 카드 (이번 달 전체 + 다음 달 미리보기)

import { todayKey } from '../store.js';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function shiftDays(date, delta) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    return d;
}

// 오늘이 속한 달을 통째로 그린다. 6주 그리드라 앞뒤로 옆달 며칠이 미리보기로 함께 보인다.
// questLog: { 날짜: [questId..] }  /  visitLog: { 날짜: true }
// 접속만 한 날 = 노랑 테두리. 퀘스트를 하나라도 깨면 노랑이 사라지고 초록(일부/완료)이 뜬다.
export function stampCalendarHtml(questLog = {}, visitLog = {}) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const gridStart = shiftDays(first, -first.getDay());
    const weeks = 6;

    const head = DAY_LABELS.map((d) => `<li class="stamp-calendar-day-label">${d}</li>`).join('');
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
        const date = shiftDays(gridStart, i);
        const key = todayKey(date);
        const count = (questLog[key] || []).length;
        const perfect = count >= 3;
        const partial = count >= 1 && count < 3;
        const visitOnly = count === 0 && !!visitLog[key];
        const isFuture = date > today;
        const isOutside = date.getMonth() !== month;
        const cls = [
            'stamp-calendar-cell',
            perfect ? 'is-perfect' : '',
            partial ? 'is-partial' : '',
            visitOnly ? 'is-visit' : '',
            isFuture ? 'is-future' : '',
            isOutside ? 'is-outside' : ''
        ].filter(Boolean).join(' ');
        cells.push(`<li class="${cls}" title="${key} — 퀘스트 ${count}/3">${perfect ? '★' : date.getDate()}</li>`);
    }

    return `
        <div class="stamp-calendar">
            <p class="stamp-calendar-caption">${year}. ${String(month + 1).padStart(2, '0')}</p>
            <ul class="stamp-calendar-head">${head}</ul>
            <ul class="stamp-calendar-grid">${cells.join('')}</ul>
            <ul class="stamp-calendar-legend">
                <li><span class="dot dot-visit"></span>접속</li>
                <li><span class="dot dot-partial"></span>일부 완료</li>
                <li><span class="dot dot-perfect">★</span>3개 완료</li>
            </ul>
        </div>
    `;
}
