import { getState, markQuestDone, setStreak, getDayStat } from '../store.js';
import { dailyQuests, calculateStreak, perfectDays, nextReward } from '../core/streak.js';
import { stampCalendarHtml } from '../components/stampCalendar.js';

function evaluateQuests(quests) {
    const today = getDayStat();
    const bySlot = Object.fromEntries(quests.map((q) => [q.slot, q]));
    return {
        battle_3win: today.battle >= bySlot.battle.target,
        typing_90acc: today.typingAcc >= bySlot.typing.target,
        diagnose_use: today.diagnose >= bySlot.diagnose.target
    };
}

export function render(container) {
    const quests = dailyQuests();
    const status = evaluateQuests(quests);

    Object.entries(status).forEach(([id, done]) => {
        if (done) markQuestDone(id);
    });

    const fresh = getState();
    const streak = calculateStreak(fresh.visitLog);
    setStreak(streak);

    const stamps = perfectDays(fresh.questLog);
    const reward = nextReward(stamps);

    container.innerHTML = `
        <section class="container quest-page">
            <h2 class="page-title">오늘의 퀘스트 / 스탬프</h2>
            <p class="page-desc">
                <strong>매일 한 번</strong> 접속하면 연속 일수(🔥)가 이어져요. 하루라도 비면 0부터 다시 시작합니다.
                그날 퀘스트 3개를 모두 깨면 달력에 스탬프(★)가 찍히고, 스탬프를 모으면 보상을 얻습니다.
            </p>

            <div class="quest-streak">
                <span class="quest-streak-badge">🔥 ${streak.current}일 연속</span>
                <span class="hint-text">최장 ${streak.longest}일 · 스탬프 ${stamps}개</span>
            </div>

            <h3 class="battle-panel-title">오늘의 퀘스트</h3>
            <ul class="quest-list">
                ${quests.map((q) => `
                    <li class="quest-item ${status[q.id] ? 'is-done' : ''}">
                        <span class="quest-item-check">${status[q.id] ? '✔' : ''}</span>
                        ${q.label}
                    </li>
                `).join('')}
            </ul>

            <h3 class="battle-panel-title">스탬프 카드</h3>
            ${stampCalendarHtml(fresh.questLog, fresh.visitLog)}

            <h3 class="battle-panel-title">다음 보상</h3>
            <p class="quest-reward">
                ${reward
                    ? `<strong>${reward.title}</strong> 까지 스탬프 ${reward.remaining}개 남음`
                    : '모든 칭호를 모았습니다! 🎉'}
            </p>
            <p class="hint-text">모은 칭호는 <a href="#me">마이페이지</a>와 헤더 오른쪽에서 볼 수 있어요.</p>
        </section>
    `;
}
