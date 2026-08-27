import { getState, markQuestDone, setStreak, todayKey } from '../store.js';
import { DAILY_QUESTS, STAMP_REWARDS, calculateStreak, totalStamps, nextReward } from '../core/streak.js';
import { stampCalendarHtml } from '../components/stampCalendar.js';

function evaluateQuests(state) {
    const today = todayKey();
    const battleWinsToday = state.battleRecords
        .filter((r) => r.date === today && r.result === 'win').length;
    const typing90Today = state.typingRecords
        .some((r) => r.date === today && r.accuracy >= 90);
    const doneLog = new Set(state.questLog[today] || []);

    return {
        battle_3win: battleWinsToday >= 3,
        typing_90acc: typing90Today,
        diagnose_use: doneLog.has('diagnose_use')
    };
}

export function render(container) {
    const state = getState();
    const status = evaluateQuests(state);

    Object.entries(status).forEach(([id, done]) => {
        if (done) markQuestDone(id);
    });

    const fresh = getState();
    const streak = calculateStreak(fresh.questLog);
    setStreak(streak);

    const stamps = totalStamps(fresh.questLog);
    const reward = nextReward(stamps);

    container.innerHTML = `
        <section class="container quest-page">
            <h1 class="page-title">오늘의 퀘스트 / 스탬프</h1>
            <p class="page-desc">매일 3개의 퀘스트를 완료해 스트릭을 이어가고 스탬프를 모으세요.</p>

            <div class="quest-streak">
                <span class="quest-streak-badge">🔥 ${streak.current}일 연속</span>
                <span class="hint-text">최장 ${streak.longest}일 · 누적 스탬프 ${stamps}개</span>
            </div>

            <h2 class="battle-panel-title">오늘의 퀘스트</h2>
            <ul class="quest-list">
                ${DAILY_QUESTS.map((q) => `
                    <li class="quest-item ${status[q.id] ? 'is-done' : ''}">
                        <span class="quest-item-check">${status[q.id] ? '✔' : ''}</span>
                        ${q.label}
                    </li>
                `).join('')}
            </ul>

            <h2 class="battle-panel-title">스탬프 카드</h2>
            ${stampCalendarHtml(fresh.questLog, 4)}

            <h2 class="battle-panel-title">다음 보상</h2>
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
