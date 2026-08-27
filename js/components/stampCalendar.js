// 퀘스트 모드 스탬프 달력 카드 (주간 그리드형)

import { todayKey } from '../store.js';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function shiftDays(date, delta) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    return d;
}

// questLog 기준으로 최근 weeks주 그리드를 그린다. requiredCount개 이상 완료한 날에 도장.
export function stampCalendarHtml(questLog, weeks = 4, requiredCount = 1) {
    const today = new Date();
    const end = shiftDays(today, 6 - today.getDay());
    const start = shiftDays(end, -(weeks * 7 - 1));

    const head = DAY_LABELS.map((d) => `<li class="stamp-calendar-day-label">${d}</li>`).join('');
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
        const date = shiftDays(start, i);
        const key = todayKey(date);
        const count = (questLog[key] || []).length;
        const done = count >= requiredCount;
        const isToday = key === todayKey(today);
        const isFuture = date > today;
        const cls = [
            'stamp-calendar-cell',
            done ? 'is-done' : '',
            isToday ? 'is-today' : '',
            isFuture ? 'is-future' : ''
        ].filter(Boolean).join(' ');
        cells.push(`<li class="${cls}" title="${key} (${count}/3)">${done ? '★' : date.getDate()}</li>`);
    }

    return `
        <div class="stamp-calendar">
            <ul class="stamp-calendar-head">${head}</ul>
            <ul class="stamp-calendar-grid">${cells.join('')}</ul>
        </div>
    `;
}
