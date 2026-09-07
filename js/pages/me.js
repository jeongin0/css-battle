import { getState } from '../store.js';
import { calculateStreak, perfectDays, nextReward, STAMP_REWARDS } from '../core/streak.js';

export function currentTitle(stamps) {
    let earned = null;
    for (const r of STAMP_REWARDS) {
        if (stamps >= r.count) earned = r;
    }
    return earned ? earned.title : '신입 도전자';
}

export function render(container) {
    const state = getState();
    const streak = calculateStreak(state.visitLog);
    const stamps = perfectDays(state.questLog);
    const reward = nextReward(stamps);
    const title = currentTitle(stamps);
    const visits = Object.keys(state.visitLog || {}).length;

    container.innerHTML = `
        <section class="container me-page">
            <h2 class="page-title">마이페이지</h2>
            <p class="page-desc">지금까지 모은 스탬프와 칭호, 그리고 각 칭호의 획득 조건입니다.</p>

            <div class="me-card">
                <p class="me-card-label">현재 칭호</p>
                <p class="me-card-title">${title}</p>
                <dl class="me-figures">
                    <div><dt>🔥 연속 접속</dt><dd>${streak.current}일</dd></div>
                    <div><dt>최장 연속</dt><dd>${streak.longest}일</dd></div>
                    <div><dt>스탬프(퍼펙트 데이)</dt><dd>${stamps}개</dd></div>
                    <div><dt>총 접속일</dt><dd>${visits}일</dd></div>
                </dl>
            </div>

            <h3 class="battle-panel-title">칭호 목록</h3>
            <p class="me-titles-intro">
                <strong>퍼펙트 데이</strong> = 하루에 그날 퀘스트 3개(배틀 · 타자연습 · CSS 디버그)를 모두 완료한 날.
                퍼펙트 데이가 쌓이면 아래 칭호가 자동으로 열립니다. 연속으로 할 필요는 없어요.
            </p>
            <p class="me-next">
                ${reward
                    ? `다음 칭호 <strong>${reward.title}</strong> 까지 퍼펙트 데이 ${reward.remaining}일`
                    : '모든 칭호를 모았습니다! 🎉'}
            </p>
            <ul class="me-titles">
                <li class="is-unlocked">
                    <span class="me-titles-count">시작</span>
                    <span class="me-titles-body">
                        <span class="me-titles-name">신입 도전자</span>
                        <span class="me-titles-desc">기본 칭호 — 아무 조건 없음</span>
                    </span>
                    <span class="me-titles-state">보유</span>
                </li>
                ${STAMP_REWARDS.map((r) => `
                    <li class="${stamps >= r.count ? 'is-unlocked' : ''}">
                        <span class="me-titles-count">스탬프 ${r.count}개</span>
                        <span class="me-titles-body">
                            <span class="me-titles-name">${r.title}</span>
                            <span class="me-titles-desc">${r.desc}</span>
                        </span>
                        <span class="me-titles-state">${stamps >= r.count ? '획득' : '잠김'}</span>
                    </li>
                `).join('')}
            </ul>

            <p class="hint-text">퍼펙트 데이 판정은 <a href="#quest">퀘스트</a> 페이지에 들어올 때 갱신됩니다.</p>
        </section>
    `;
}
