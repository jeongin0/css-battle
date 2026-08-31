import { getState, markQuestDone, setStreak, todayKey } from '../store.js';
import { dailyQuests, STAMP_REWARDS, calculateStreak, perfectDays, nextReward } from '../core/streak.js';
import { stampCalendarHtml } from '../components/stampCalendar.js';

function evaluateQuests(state, quests) {
    const today = todayKey();
    const battleWinsToday = state.battleRecords
        .filter((r) => r.date === today && r.result === 'win').length;
    const bestTypingAccToday = state.typingRecords
        .filter((r) => r.date === today)
        .reduce((max, r) => Math.max(max, r.accuracy || 0), 0);
    const diagnoseSolvedToday = (state.diagnoseRecords || [])
        .filter((r) => r.date === today).length;

    const bySlot = Object.fromEntries(quests.map((q) => [q.slot, q]));
    return {
        battle_3win: battleWinsToday >= bySlot.battle.target,
        typing_90acc: bestTypingAccToday >= bySlot.typing.target,
        diagnose_use: diagnoseSolvedToday >= bySlot.diagnose.target
    };
}

export function render(container) {
    const state = getState();
    const quests = dailyQuests();
    const status = evaluateQuests(state, quests);

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
                    : '모든 보상을 달성했습니다! 🎉'}
            </p>
            <ul class="quest-reward-list">
                ${STAMP_REWARDS.map((r) => `
                    <li class="${stamps >= r.count ? 'is-unlocked' : ''}">${r.count}개 — ${r.title}</li>
                `).join('')}
            </ul>
        </section>
    `;
}
