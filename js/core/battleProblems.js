// 배틀 모드 시안 풀 — 난이도별 15개, 구조(컴포넌트 타입) 중복 없음.
// 각 문제: html(스타일 없는 구조, 아이콘은 인라인 SVG) / answerCss(정답 = 시안 + 채점 기준)
//         palette(색상 스와치) / check(검증 대상 { sel, props })

const COMMON_HEAD = `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
*, *::before, *::after { box-sizing: border-box; }
svg { display: block; }
body { margin: 0; padding: 20px; font-family: 'Pretendard', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background: #f4f4f6; }`;

export function previewDoc(html, css) {
    return `<!doctype html><html><head><style>${COMMON_HEAD}\n${css || ''}</style></head><body>${html}</body></html>`;
}

const BOX = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
const c = (sel, ...props) => ({ sel, props });

// 선 아이콘
const LINE = {
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    folder: '<path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'
};
const FILL = {
    star: '<path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/>',
    heart: '<path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/>',
    dot: '<circle cx="12" cy="12" r="6"/>'
};
const icon = (name, cls) => LINE[name]
    ? `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LINE[name]}</svg>`
    : `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor">${FILL[name]}</svg>`;

export const BATTLE_POOLS = {
    /* ======================= 초급 ======================= */
    low: [
        {
            id: 'low-profile', name: '프로필 뱃지',
            html:
`<div class="profile">
    <span class="profile-avatar">A</span>
    <span class="profile-name">Ada Lovelace</span>
    <span class="profile-role">Engineer</span>
</div>`,
            answerCss:
`.profile { display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; width: 320px; }
.profile-avatar { width: 40px; height: 40px; border-radius: 999px; background: #4f46e5; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.profile-name { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; }
.profile-role { font-size: 13px; color: #6b7280; margin-left: auto; white-space: nowrap; }`,
            palette: ['#4F46E5', '#111827', '#6B7280', '#E5E7EB', '#FFFFFF'],
            check: [c('.profile', 'display', 'align-items', 'gap', 'padding-top', 'background-color', 'border-radius'),
                c('.profile-avatar', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.profile-name', 'font-size', 'font-weight', 'color'), c('.profile-role', 'font-size', 'color')]
        },
        {
            id: 'low-stat', name: '지표 카드',
            html:
`<div class="stat">
    <p class="stat-value">2,847</p>
    <p class="stat-label">이번 주 방문자</p>
    <p class="stat-delta">+12.5%</p>
</div>`,
            answerCss:
`.stat { padding: 20px; background: #0f172a; border-radius: 14px; width: 240px; }
.stat-value { margin: 0; font-size: 32px; font-weight: 800; color: #f8fafc; }
.stat-label { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
.stat-delta { margin: 12px 0 0; font-size: 13px; font-weight: 700; color: #4ade80; }`,
            palette: ['#0F172A', '#F8FAFC', '#94A3B8', '#4ADE80'],
            check: [c('.stat', 'padding-top', 'background-color', 'border-radius'),
                c('.stat-value', 'font-size', 'font-weight', 'color', 'margin-top'),
                c('.stat-label', 'font-size', 'color'), c('.stat-delta', 'font-size', 'font-weight', 'color', 'margin-top')]
        },
        {
            id: 'low-notice', name: '안내 배너',
            html:
`<p class="notice">
    ${icon('info', 'notice-icon')}
    변경 사항은 자동으로 저장됩니다.
</p>`,
            answerCss:
`.notice { display: flex; align-items: center; gap: 10px; margin: 0; padding: 12px 16px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; font-size: 14px; color: #1e3a8a; width: 360px; }
.notice-icon { width: 20px; height: 20px; color: #3b82f6; flex-shrink: 0; }`,
            palette: ['#EFF6FF', '#3B82F6', '#1E3A8A'],
            check: [c('.notice', 'display', 'align-items', 'gap', 'padding-top', 'background-color', 'border-left-width', 'border-left-color', 'border-radius', 'font-size', 'color'),
                c('.notice-icon', 'width', 'height', 'color')]
        },
        {
            id: 'low-price', name: '가격 표시',
            html:
`<p class="price">
    <span class="price-cur">₩</span>
    <span class="price-num">12,000</span>
    <span class="price-per">/ 월</span>
</p>`,
            answerCss:
`.price { margin: 0; display: flex; align-items: baseline; gap: 4px; color: #111827; }
.price-cur { font-size: 18px; font-weight: 600; }
.price-num { font-size: 36px; font-weight: 800; }
.price-per { font-size: 14px; font-weight: 500; color: #9ca3af; }`,
            palette: ['#111827', '#9CA3AF'],
            check: [c('.price', 'display', 'align-items', 'gap', 'color'),
                c('.price-cur', 'font-size', 'font-weight'), c('.price-num', 'font-size', 'font-weight'),
                c('.price-per', 'font-size', 'font-weight', 'color')]
        },
        {
            id: 'low-avatars', name: '아바타 그룹',
            html:
`<div class="avs">
    <span class="av">A</span>
    <span class="av">B</span>
    <span class="av">C</span>
    <span class="av av-more">+5</span>
</div>`,
            answerCss:
`.avs { display: flex; }
.av { width: 36px; height: 36px; border-radius: 999px; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; border: 2px solid #fff; margin-left: -10px; }
.av:first-child { margin-left: 0; }
.av-more { background: #e5e7eb; color: #4b5563; }`,
            palette: ['#6366F1', '#FFFFFF', '#E5E7EB', '#4B5563'],
            check: [c('.avs', 'display'),
                c('.av', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight', 'border-top-width'),
                c('.av-more', 'background-color', 'color')]
        },
        {
            id: 'low-status', name: '상태 뱃지',
            html:
`<span class="status">
    ${icon('dot', 'status-dot')}
    <span class="status-text">가동 중</span>
</span>`,
            answerCss:
`.status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #ecfdf5; border-radius: 999px; }
.status-dot { width: 8px; height: 8px; color: #10b981; }
.status-text { font-size: 12px; font-weight: 600; color: #065f46; }`,
            palette: ['#ECFDF5', '#10B981', '#065F46'],
            check: [c('.status', 'display', 'align-items', 'gap', 'padding-top', 'background-color', 'border-radius'),
                c('.status-dot', 'width', 'height', 'color'), c('.status-text', 'font-size', 'font-weight', 'color')]
        },
        {
            id: 'low-iconbtn', name: '아이콘 버튼',
            html:
`<button class="iconbtn">
    ${icon('plus', 'iconbtn-icon')}
    <span class="iconbtn-label">새로 만들기</span>
</button>`,
            answerCss:
`.iconbtn { display: inline-flex; align-items: center; gap: 8px; border: 0; padding: 10px 16px; border-radius: 8px; background: #111827; color: #fff; cursor: pointer; }
.iconbtn-icon { width: 16px; height: 16px; }
.iconbtn-label { font-size: 14px; font-weight: 600; }`,
            palette: ['#111827', '#FFFFFF'],
            check: [c('.iconbtn', 'display', 'align-items', 'gap', 'padding-top', 'border-radius', 'background-color', 'color'),
                c('.iconbtn-icon', 'width', 'height'), c('.iconbtn-label', 'font-size', 'font-weight')]
        },
        {
            id: 'low-progress', name: '진행바',
            html:
`<div class="prog">
    <p class="prog-label">업로드 중 · 68%</p>
    <div class="prog-track"><div class="prog-fill"></div></div>
</div>`,
            answerCss:
`.prog { width: 300px; }
.prog-label { margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151; }
.prog-track { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.prog-fill { width: 68%; height: 100%; background: #6366f1; }`,
            palette: ['#374151', '#E5E7EB', '#6366F1'],
            check: [c('.prog-label', 'font-size', 'font-weight', 'color', 'margin-bottom'),
                c('.prog-track', 'height', 'background-color', 'border-radius'),
                c('.prog-fill', 'width', 'height', 'background-color')]
        },
        {
            id: 'low-rating', name: '별점',
            html:
`<div class="rate">
    ${icon('star', 'rate-star rate-on')}
    ${icon('star', 'rate-star rate-on')}
    ${icon('star', 'rate-star rate-on')}
    ${icon('star', 'rate-star')}
    ${icon('star', 'rate-star')}
    <span class="rate-num">3.0</span>
</div>`,
            answerCss:
`.rate { display: flex; align-items: center; gap: 2px; }
.rate-star { width: 18px; height: 18px; color: #d1d5db; }
.rate-star.rate-on { color: #f59e0b; }
.rate-num { margin-left: 6px; font-size: 13px; font-weight: 700; color: #374151; }`,
            palette: ['#D1D5DB', '#F59E0B', '#374151'],
            check: [c('.rate', 'display', 'align-items', 'gap'),
                c('.rate-star', 'width', 'height', 'color'), c('.rate-star.rate-on', 'color'),
                c('.rate-num', 'font-size', 'font-weight', 'color')]
        },
        {
            id: 'low-kbd', name: '단축키 표시',
            html:
`<p class="hint">저장하려면 <kbd class="key">⌘</kbd><kbd class="key">S</kbd> 를 누르세요</p>`,
            answerCss:
`.hint { margin: 0; font-size: 14px; color: #4b5563; }
.key { display: inline-block; min-width: 24px; padding: 2px 6px; border-radius: 6px; background: #f3f4f6; border: 1px solid #d1d5db; border-bottom-width: 2px; font-family: inherit; font-size: 12px; font-weight: 600; color: #111827; text-align: center; }`,
            palette: ['#4B5563', '#F3F4F6', '#D1D5DB', '#111827'],
            check: [c('.hint', 'font-size', 'color'),
                c('.key', 'display', 'padding-top', 'border-radius', 'background-color', 'border-top-color', 'font-size', 'font-weight', 'color')]
        },
        {
            id: 'low-notif', name: '알림 아이콘',
            html:
`<div class="nb">
    ${icon('bell', 'nb-bell')}
    <span class="nb-count">9</span>
</div>`,
            answerCss:
`.nb { position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #f3f4f6; }
.nb-bell { width: 20px; height: 20px; color: #374151; }
.nb-count { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }`,
            palette: ['#F3F4F6', '#374151', '#EF4444', '#FFFFFF'],
            check: [c('.nb', 'width', 'height', 'border-radius', 'background-color'),
                c('.nb-bell', 'width', 'height', 'color'),
                c('.nb-count', 'background-color', 'color', 'font-size', 'font-weight', 'border-radius')]
        },
        {
            id: 'low-linkprev', name: '링크 프리뷰',
            html:
`<a class="lp">
    ${icon('external', 'lp-icon')}
    <span class="lp-title">디자인 시스템 핸드북</span>
    <span class="lp-host">handbook.dev</span>
</a>`,
            answerCss:
`.lp { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; text-decoration: none; width: 340px; }
.lp-icon { width: 16px; height: 16px; color: #6b7280; flex-shrink: 0; }
.lp-title { font-size: 14px; font-weight: 600; color: #111827; }
.lp-host { margin-left: auto; font-size: 12px; color: #9ca3af; }`,
            palette: ['#E5E7EB', '#6B7280', '#111827', '#9CA3AF'],
            check: [c('.lp', 'display', 'align-items', 'gap', 'padding-top', 'border-top-width', 'border-radius'),
                c('.lp-icon', 'width', 'height', 'color'),
                c('.lp-title', 'font-size', 'font-weight', 'color'), c('.lp-host', 'font-size', 'color')]
        },
        {
            id: 'low-toggle', name: '토글 스위치',
            html:
`<div class="tg">
    <span class="tg-label">알림 받기</span>
    <span class="tg-switch"><span class="tg-knob"></span></span>
</div>`,
            answerCss:
`.tg { display: flex; align-items: center; gap: 12px; }
.tg-label { font-size: 14px; font-weight: 600; color: #374151; }
.tg-switch { width: 44px; height: 24px; border-radius: 999px; background: #6366f1; padding: 2px; display: flex; justify-content: flex-end; }
.tg-knob { width: 20px; height: 20px; border-radius: 999px; background: #fff; }`,
            palette: ['#374151', '#6366F1', '#FFFFFF'],
            check: [c('.tg', 'display', 'align-items', 'gap'),
                c('.tg-label', 'font-size', 'font-weight', 'color'),
                c('.tg-switch', 'width', 'height', 'border-radius', 'background-color', 'justify-content'),
                c('.tg-knob', 'width', 'height', 'border-radius', 'background-color')]
        },
        {
            id: 'low-quote', name: '인용구',
            html:
`<blockquote class="quote">
    <p class="quote-text">디자인은 어떻게 보이느냐가 아니라 어떻게 작동하느냐다.</p>
    <footer class="quote-by">— Steve Jobs</footer>
</blockquote>`,
            answerCss:
`.quote { margin: 0; padding: 16px 20px; border-left: 3px solid #111827; background: #fafafa; width: 400px; }
.quote-text { margin: 0; font-size: 16px; font-style: italic; color: #1f2937; line-height: 1.6; }
.quote-by { margin-top: 8px; font-size: 13px; font-weight: 600; color: #6b7280; }`,
            palette: ['#111827', '#FAFAFA', '#1F2937', '#6B7280'],
            check: [c('.quote', 'padding-top', 'border-left-width', 'border-left-color', 'background-color'),
                c('.quote-text', 'font-size', 'font-style', 'color'),
                c('.quote-by', 'font-size', 'font-weight', 'color', 'margin-top')]
        },
        {
            id: 'low-chip', name: '삭제 가능 칩',
            html:
`<span class="chip">
    <span class="chip-text">React</span>
    ${icon('x', 'chip-x')}
</span>`,
            answerCss:
`.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 4px 4px 12px; border-radius: 999px; background: #eef2ff; }
.chip-text { font-size: 13px; font-weight: 600; color: #4338ca; }
.chip-x { width: 16px; height: 16px; color: #6366f1; cursor: pointer; }`,
            palette: ['#EEF2FF', '#4338CA', '#6366F1'],
            check: [c('.chip', 'display', 'align-items', 'gap', 'padding-left', 'border-radius', 'background-color'),
                c('.chip-text', 'font-size', 'font-weight', 'color'), c('.chip-x', 'width', 'height', 'color')]
        }
    ],
    /* ======================= 중급 ======================= */
    mid: [
        {
            id: 'mid-segmented', name: '세그먼트 컨트롤',
            html:
`<div class="seg">
    <button class="seg-item">일간</button>
    <button class="seg-item is-active">주간</button>
    <button class="seg-item">월간</button>
</div>`,
            answerCss:
`.seg { display: inline-flex; gap: 4px; padding: 4px; background: #f1f5f9; border-radius: 10px; }
.seg-item { border: 0; padding: 8px 16px; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; }
.seg-item.is-active { background: #fff; color: #0f172a; }`,
            palette: ['#F1F5F9', '#64748B', '#0F172A', '#FFFFFF'],
            check: [c('.seg', 'display', 'gap', 'padding-top', 'background-color', 'border-radius'),
                c('.seg-item', 'padding-top', 'padding-left', 'border-radius', 'font-size', 'font-weight', 'color'),
                c('.seg-item.is-active', 'background-color', 'color')]
        },
        {
            id: 'mid-todo', name: '할 일 항목',
            html:
`<ul class="todo">
    <li class="todo-item">보고서 초안 작성</li>
    <li class="todo-item is-done">회의실 예약</li>
</ul>`,
            answerCss:
`.todo { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; width: 320px; }
.todo-item { padding: 12px 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #111827; }
.todo-item.is-done { color: #9ca3af; text-decoration: line-through; background: #f9fafb; }`,
            palette: ['#FFFFFF', '#E5E7EB', '#111827', '#9CA3AF', '#F9FAFB'],
            check: [c('.todo', 'display', 'flex-direction', 'gap', 'padding-left'),
                c('.todo-item', 'padding-top', 'background-color', 'border-top-width', 'border-radius', 'font-size', 'color'),
                c('.todo-item.is-done', 'color', 'text-decoration-line', 'background-color')]
        },
        {
            id: 'mid-tags', name: '태그 목록',
            html:
`<p class="tags">
    <span class="tag">디자인</span>
    <span class="tag tag-primary">공지</span>
    <span class="tag">개발</span>
</p>`,
            answerCss:
`.tags { margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 4px 10px; border-radius: 999px; background: #f3f4f6; font-size: 12px; font-weight: 600; color: #4b5563; }
.tag.tag-primary { background: #fef3c7; color: #92400e; }`,
            palette: ['#F3F4F6', '#4B5563', '#FEF3C7', '#92400E'],
            check: [c('.tags', 'display', 'gap'),
                c('.tag', 'padding-top', 'padding-left', 'border-radius', 'background-color', 'font-size', 'font-weight', 'color'),
                c('.tag.tag-primary', 'background-color', 'color')]
        },
        {
            id: 'mid-media', name: '미디어 카드',
            html:
`<article class="media">
    <div class="media-thumb">${icon('image', 'media-thumb-icon')}</div>
    <div class="media-body">
        <h3 class="media-title">디자인 시스템 구축기</h3>
        <p class="media-desc">토큰부터 컴포넌트까지</p>
    </div>
</article>`,
            answerCss:
`.media { display: flex; gap: 16px; padding: 16px; background: #fff; border: 1px solid #eceff3; border-radius: 14px; width: 420px; }
.media-thumb { flex: 0 0 88px; height: 88px; border-radius: 10px; background: #e0e7ff; display: flex; align-items: center; justify-content: center; }
.media-thumb-icon { width: 28px; height: 28px; color: #6366f1; }
.media-body { display: flex; flex-direction: column; gap: 4px; }
.media-title { margin: 0; font-size: 16px; font-weight: 700; color: #111827; }
.media-desc { margin: 0; font-size: 13px; color: #6b7280; }`,
            palette: ['#FFFFFF', '#E0E7FF', '#6366F1', '#111827', '#6B7280'],
            check: [c('.media', 'display', 'gap', 'padding-top', 'background-color', 'border-radius'),
                c('.media-thumb', 'height', 'border-radius', 'background-color', 'align-items'),
                c('.media-thumb-icon', 'width', 'color'),
                c('.media-title', 'font-size', 'font-weight', 'color'), c('.media-desc', 'font-size', 'color')]
        },
        {
            id: 'mid-tabbar', name: '탭 바',
            html:
`<nav class="tabbar">
    <a class="tab is-active">개요</a>
    <a class="tab">활동</a>
    <a class="tab">설정</a>
</nav>`,
            answerCss:
`.tabbar { display: flex; gap: 24px; border-bottom: 1px solid #e5e7eb; }
.tab { padding: 12px 0; font-size: 14px; font-weight: 600; color: #6b7280; border-bottom: 2px solid transparent; text-decoration: none; }
.tab.is-active { color: #4f46e5; border-bottom-color: #4f46e5; }`,
            palette: ['#E5E7EB', '#6B7280', '#4F46E5'],
            check: [c('.tabbar', 'display', 'gap', 'border-bottom-width', 'border-bottom-color'),
                c('.tab', 'padding-top', 'font-size', 'font-weight', 'color'),
                c('.tab.is-active', 'color', 'border-bottom-color')]
        },
        {
            id: 'mid-pagination', name: '페이지네이션',
            html:
`<nav class="pg">
    <button class="pg-btn">${icon('chevronRight', 'pg-prev-icon')}</button>
    <button class="pg-num">1</button>
    <button class="pg-num is-current">2</button>
    <button class="pg-num">3</button>
    <button class="pg-btn">${icon('chevronRight', 'pg-next-icon')}</button>
</nav>`,
            answerCss:
`.pg { display: flex; align-items: center; gap: 4px; }
.pg-num, .pg-btn { width: 36px; height: 36px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pg-num.is-current { background: #111827; color: #fff; border-color: #111827; }
.pg-prev-icon, .pg-next-icon { width: 14px; height: 14px; }
.pg-prev-icon { transform: rotate(180deg); }`,
            palette: ['#E5E7EB', '#374151', '#111827', '#FFFFFF'],
            check: [c('.pg', 'display', 'align-items', 'gap'),
                c('.pg-num', 'width', 'height', 'border-top-width', 'border-radius', 'background-color', 'font-weight', 'color'),
                c('.pg-num.is-current', 'background-color', 'color')]
        },
        {
            id: 'mid-breadcrumb', name: '브레드크럼',
            html:
`<nav class="bc">
    <a class="bc-link">홈</a>
    ${icon('chevronRight', 'bc-sep')}
    <a class="bc-link">문서</a>
    ${icon('chevronRight', 'bc-sep')}
    <span class="bc-current">시작하기</span>
</nav>`,
            answerCss:
`.bc { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.bc-link { color: #6b7280; text-decoration: none; }
.bc-sep { width: 14px; height: 14px; color: #d1d5db; }
.bc-current { font-weight: 600; color: #111827; }`,
            palette: ['#6B7280', '#D1D5DB', '#111827'],
            check: [c('.bc', 'display', 'align-items', 'gap', 'font-size'),
                c('.bc-link', 'color'), c('.bc-sep', 'width', 'color'),
                c('.bc-current', 'font-weight', 'color')]
        },
        {
            id: 'mid-toast', name: '토스트 알림',
            html:
`<div class="toast">
    ${icon('check', 'toast-icon')}
    <p class="toast-msg">변경 사항이 저장되었습니다.</p>
    ${icon('x', 'toast-close')}
</div>`,
            answerCss:
`.toast { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #111827; border-radius: 12px; width: 380px; }
.toast-icon { width: 18px; height: 18px; color: #4ade80; flex-shrink: 0; }
.toast-msg { margin: 0; flex: 1; font-size: 14px; color: #f9fafb; }
.toast-close { width: 16px; height: 16px; color: #9ca3af; cursor: pointer; }`,
            palette: ['#111827', '#4ADE80', '#F9FAFB', '#9CA3AF'],
            check: [c('.toast', 'display', 'align-items', 'gap', 'padding-top', 'background-color', 'border-radius'),
                c('.toast-icon', 'width', 'color'), c('.toast-msg', 'font-size', 'color'),
                c('.toast-close', 'width', 'color')]
        },
        {
            id: 'mid-accordion', name: '아코디언 헤더',
            html:
`<button class="acc">
    <span class="acc-title">환불 정책이 어떻게 되나요?</span>
    ${icon('chevronDown', 'acc-icon')}
</button>`,
            answerCss:
`.acc { display: flex; align-items: center; justify-content: space-between; width: 420px; padding: 16px 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; cursor: pointer; }
.acc-title { font-size: 15px; font-weight: 600; color: #111827; }
.acc-icon { width: 18px; height: 18px; color: #6b7280; }`,
            palette: ['#E5E7EB', '#111827', '#6B7280', '#FFFFFF'],
            check: [c('.acc', 'display', 'align-items', 'justify-content', 'padding-top', 'border-top-width', 'border-radius', 'background-color'),
                c('.acc-title', 'font-size', 'font-weight', 'color'), c('.acc-icon', 'width', 'color')]
        },
        {
            id: 'mid-steps', name: '스텝 인디케이터',
            html:
`<ol class="steps">
    <li class="step is-done">1</li>
    <li class="step is-current">2</li>
    <li class="step">3</li>
</ol>`,
            answerCss:
`.steps { list-style: none; margin: 0; padding: 0; display: flex; gap: 12px; }
.step { width: 32px; height: 32px; border-radius: 999px; background: #e5e7eb; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
.step.is-done { background: #dcfce7; color: #166534; }
.step.is-current { background: #4f46e5; color: #fff; }`,
            palette: ['#E5E7EB', '#6B7280', '#DCFCE7', '#166534', '#4F46E5'],
            check: [c('.steps', 'display', 'gap', 'padding-left'),
                c('.step', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.step.is-done', 'background-color', 'color'), c('.step.is-current', 'background-color', 'color')]
        },
        {
            id: 'mid-fileitem', name: '파일 항목',
            html:
`<div class="file">
    <span class="file-ic">${icon('folder', 'file-ic-svg')}</span>
    <div class="file-info">
        <p class="file-name">보고서-최종.pdf</p>
        <p class="file-meta">2.4 MB</p>
    </div>
    ${icon('download', 'file-dl')}
</div>`,
            answerCss:
`.file { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; width: 360px; }
.file-ic { width: 36px; height: 36px; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.file-ic-svg { width: 18px; height: 18px; color: #3b82f6; }
.file-info { flex: 1; }
.file-name { margin: 0; font-size: 13px; font-weight: 600; color: #111827; }
.file-meta { margin: 2px 0 0; font-size: 12px; color: #9ca3af; }
.file-dl { width: 18px; height: 18px; color: #6b7280; cursor: pointer; }`,
            palette: ['#E5E7EB', '#EFF6FF', '#3B82F6', '#111827', '#9CA3AF', '#6B7280'],
            check: [c('.file', 'display', 'align-items', 'gap', 'padding-top', 'border-top-width', 'border-radius'),
                c('.file-ic', 'width', 'height', 'border-radius', 'background-color'),
                c('.file-ic-svg', 'width', 'color'),
                c('.file-name', 'font-size', 'font-weight', 'color'), c('.file-meta', 'font-size', 'color')]
        },
        {
            id: 'mid-filterchips', name: '필터 칩 그룹',
            html:
`<div class="fc">
    <button class="fc-chip is-on">전체</button>
    <button class="fc-chip">진행 중</button>
    <button class="fc-chip">완료</button>
</div>`,
            answerCss:
`.fc { display: flex; gap: 8px; }
.fc-chip { border: 1px solid #d1d5db; padding: 6px 14px; border-radius: 999px; background: #fff; font-size: 13px; font-weight: 600; color: #4b5563; cursor: pointer; }
.fc-chip.is-on { background: #111827; border-color: #111827; color: #fff; }`,
            palette: ['#D1D5DB', '#4B5563', '#111827', '#FFFFFF'],
            check: [c('.fc', 'display', 'gap'),
                c('.fc-chip', 'border-top-width', 'padding-left', 'border-radius', 'background-color', 'font-size', 'font-weight', 'color'),
                c('.fc-chip.is-on', 'background-color', 'color')]
        },
        {
            id: 'mid-stats3', name: '통계 3열',
            html:
`<dl class="s3">
    <div class="s3-item"><dt class="s3-k">방문</dt><dd class="s3-v">1.2k</dd></div>
    <div class="s3-item"><dt class="s3-k">가입</dt><dd class="s3-v">318</dd></div>
    <div class="s3-item"><dt class="s3-k">전환율</dt><dd class="s3-v">4.1%</dd></div>
</dl>`,
            answerCss:
`.s3 { display: flex; margin: 0; }
.s3-item { flex: 1; text-align: center; padding: 12px; border-right: 1px solid #e5e7eb; }
.s3-item:last-child { border-right: 0; }
.s3-k { font-size: 12px; color: #9ca3af; }
.s3-v { margin: 4px 0 0; font-size: 20px; font-weight: 800; color: #111827; }`,
            palette: ['#E5E7EB', '#9CA3AF', '#111827'],
            check: [c('.s3', 'display'),
                c('.s3-item', 'text-align', 'padding-top', 'border-right-width', 'border-right-color'),
                c('.s3-k', 'font-size', 'color'), c('.s3-v', 'font-size', 'font-weight', 'color', 'margin-top')]
        },
        {
            id: 'mid-profilecard', name: '프로필 카드 (세로)',
            html:
`<div class="pcv">
    <span class="pcv-av">M</span>
    <p class="pcv-name">문지인</p>
    <p class="pcv-role">프로덕트 디자이너</p>
    <button class="pcv-btn">팔로우</button>
</div>`,
            answerCss:
`.pcv { width: 200px; padding: 24px; background: #fff; border: 1px solid #eceff3; border-radius: 16px; text-align: center; }
.pcv-av { width: 56px; height: 56px; border-radius: 999px; background: #6366f1; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
.pcv-name { margin: 12px 0 0; font-size: 16px; font-weight: 700; color: #111827; }
.pcv-role { margin: 2px 0 0; font-size: 13px; color: #6b7280; }
.pcv-btn { margin-top: 16px; width: 100%; border: 0; padding: 8px; border-radius: 8px; background: #111827; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }`,
            palette: ['#FFFFFF', '#6366F1', '#111827', '#6B7280'],
            check: [c('.pcv', 'padding-top', 'background-color', 'border-radius', 'text-align'),
                c('.pcv-av', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.pcv-name', 'font-size', 'font-weight', 'color', 'margin-top'),
                c('.pcv-role', 'font-size', 'color'),
                c('.pcv-btn', 'border-radius', 'background-color', 'color', 'font-weight')]
        },
        {
            id: 'mid-alertbox', name: '경고 박스',
            html:
`<div class="wb">
    ${icon('alert', 'wb-icon')}
    <div class="wb-body">
        <p class="wb-title">저장 공간이 부족합니다</p>
        <p class="wb-desc">파일을 정리하거나 요금제를 업그레이드하세요.</p>
    </div>
</div>`,
            answerCss:
`.wb { display: flex; gap: 12px; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; width: 420px; }
.wb-icon { width: 20px; height: 20px; color: #d97706; flex-shrink: 0; }
.wb-title { margin: 0; font-size: 14px; font-weight: 700; color: #92400e; }
.wb-desc { margin: 4px 0 0; font-size: 13px; color: #b45309; }`,
            palette: ['#FFFBEB', '#FDE68A', '#D97706', '#92400E', '#B45309'],
            check: [c('.wb', 'display', 'gap', 'padding-top', 'background-color', 'border-top-color', 'border-radius'),
                c('.wb-icon', 'width', 'color'),
                c('.wb-title', 'font-size', 'font-weight', 'color'), c('.wb-desc', 'font-size', 'color', 'margin-top')]
        }
    ],
    /* ======================= 고급 ======================= */
    high: [
        {
            id: 'high-header', name: '사이트 헤더',
            html:
`<header class="hd">
    <a class="hd-logo">ACME</a>
    <nav class="hd-nav">
        <a class="hd-link">제품</a>
        <a class="hd-link hd-link-current">가격</a>
        <a class="hd-link">문서</a>
    </nav>
    <button class="hd-cta">시작하기</button>
</header>`,
            answerCss:
`.hd { display: flex; align-items: center; gap: 32px; padding: 16px 24px; background: #0b1020; width: 640px; }
.hd-logo { font-size: 18px; font-weight: 800; color: #fff; }
.hd-nav { display: flex; gap: 20px; }
.hd-link { font-size: 14px; color: #9aa4b2; text-decoration: none; }
.hd-link.hd-link-current { color: #fff; font-weight: 700; }
.hd-cta { margin-left: auto; border: 0; padding: 10px 18px; border-radius: 8px; background: #6366f1; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }`,
            palette: ['#0B1020', '#FFFFFF', '#9AA4B2', '#6366F1'],
            check: [c('.hd', 'display', 'align-items', 'gap', 'padding-top', 'background-color'),
                c('.hd-logo', 'font-size', 'font-weight', 'color'), c('.hd-nav', 'display', 'gap'),
                c('.hd-link', 'font-size', 'color'), c('.hd-link.hd-link-current', 'color', 'font-weight'),
                c('.hd-cta', 'padding-left', 'border-radius', 'background-color', 'color', 'font-weight')]
        },
        {
            id: 'high-pricing', name: '가격 카드 (추천)',
            html:
`<article class="pc pc-featured">
    <span class="pc-badge">추천</span>
    <h3 class="pc-name">Pro</h3>
    <p class="pc-price">₩29,000<span class="pc-per">/월</span></p>
    <ul class="pc-feats">
        <li class="pc-feat">${icon('check', 'pc-fi')}무제한 프로젝트</li>
        <li class="pc-feat">${icon('check', 'pc-fi')}우선 지원</li>
    </ul>
    <button class="pc-cta">선택</button>
</article>`,
            answerCss:
`.pc { padding: 24px; background: #fff; border: 2px solid #e5e7eb; border-radius: 16px; width: 260px; }
.pc.pc-featured { border-color: #6366f1; }
.pc-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 12px; font-weight: 700; white-space: nowrap; }
.pc-name { margin: 12px 0 0; font-size: 18px; font-weight: 700; color: #111827; }
.pc-price { margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #111827; }
.pc-per { font-size: 14px; font-weight: 500; color: #9ca3af; }
.pc-feats { list-style: none; margin: 16px 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pc-feat { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4b5563; }
.pc-fi { width: 16px; height: 16px; color: #6366f1; }
.pc-cta { width: 100%; border: 0; padding: 12px; border-radius: 10px; background: #6366f1; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }`,
            palette: ['#FFFFFF', '#6366F1', '#EEF2FF', '#4338CA', '#111827', '#9CA3AF', '#4B5563'],
            check: [c('.pc', 'padding-top', 'background-color', 'border-radius'),
                c('.pc.pc-featured', 'border-top-color', 'border-top-width'),
                c('.pc-badge', 'background-color', 'color', 'font-weight', 'border-radius'),
                c('.pc-name', 'font-size', 'font-weight', 'color'), c('.pc-price', 'font-size', 'font-weight', 'color'),
                c('.pc-per', 'font-size', 'color'), c('.pc-feats', 'display', 'flex-direction', 'gap'),
                c('.pc-feat', 'display', 'align-items', 'gap', 'font-size', 'color'), c('.pc-fi', 'width', 'color'),
                c('.pc-cta', 'border-radius', 'background-color', 'color', 'font-weight')]
        },
        {
            id: 'high-hero', name: '히어로 섹션',
            html:
`<section class="hero">
    <p class="hero-eyebrow">NEW</p>
    <h1 class="hero-title">더 빠르게 배포하세요</h1>
    <p class="hero-sub">몇 초 만에 프리뷰를 공유하고 팀과 협업하세요.</p>
    <div class="hero-actions">
        <button class="hero-btn hero-btn-primary">무료로 시작</button>
        <button class="hero-btn">데모 보기</button>
    </div>
</section>`,
            answerCss:
`.hero { padding: 40px; background: #fafafa; border-radius: 20px; width: 460px; text-align: center; }
.hero-eyebrow { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #6366f1; }
.hero-title { margin: 12px 0 0; font-size: 32px; font-weight: 800; color: #0f172a; }
.hero-sub { margin: 12px 0 0; font-size: 15px; color: #64748b; }
.hero-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
.hero-btn { border: 1px solid #d4d4d8; padding: 10px 20px; border-radius: 10px; background: #fff; font-size: 14px; font-weight: 600; color: #18181b; cursor: pointer; white-space: nowrap; }
.hero-btn.hero-btn-primary { background: #6366f1; border-color: #6366f1; color: #fff; }`,
            palette: ['#FAFAFA', '#6366F1', '#0F172A', '#64748B', '#FFFFFF', '#18181B'],
            check: [c('.hero', 'padding-top', 'background-color', 'border-radius', 'text-align'),
                c('.hero-eyebrow', 'font-size', 'font-weight', 'color'),
                c('.hero-title', 'font-size', 'font-weight', 'color', 'margin-top'),
                c('.hero-sub', 'font-size', 'color'),
                c('.hero-actions', 'display', 'justify-content', 'gap', 'margin-top'),
                c('.hero-btn', 'padding-left', 'border-radius', 'background-color', 'color'),
                c('.hero-btn.hero-btn-primary', 'background-color', 'color')]
        },
        {
            id: 'high-comment', name: '댓글',
            html:
`<article class="cmt">
    <span class="cmt-avatar">K</span>
    <div class="cmt-main">
        <p class="cmt-head"><span class="cmt-author">김하늘</span><span class="cmt-time">2시간 전</span></p>
        <p class="cmt-body">이 부분 정말 깔끔하게 잘 됐네요.</p>
        <div class="cmt-actions"><button class="cmt-act">좋아요</button><button class="cmt-act">답글</button></div>
    </div>
</article>`,
            answerCss:
`.cmt { display: flex; gap: 12px; padding: 16px; background: #fff; border-radius: 12px; width: 420px; }
.cmt-avatar { width: 36px; height: 36px; border-radius: 999px; background: #f59e0b; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.cmt-head { margin: 0; display: flex; align-items: baseline; gap: 8px; }
.cmt-author { font-size: 14px; font-weight: 700; color: #111827; }
.cmt-time { font-size: 12px; color: #9ca3af; }
.cmt-body { margin: 4px 0 0; font-size: 14px; color: #374151; }
.cmt-actions { display: flex; gap: 12px; margin-top: 8px; }
.cmt-act { border: 0; padding: 0; background: transparent; font-size: 12px; font-weight: 600; color: #6b7280; cursor: pointer; }`,
            palette: ['#FFFFFF', '#F59E0B', '#111827', '#9CA3AF', '#374151', '#6B7280'],
            check: [c('.cmt', 'display', 'gap', 'padding-top', 'border-radius'),
                c('.cmt-avatar', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.cmt-head', 'display', 'align-items', 'gap'), c('.cmt-author', 'font-size', 'font-weight', 'color'),
                c('.cmt-time', 'font-size', 'color'), c('.cmt-body', 'font-size', 'color', 'margin-top'),
                c('.cmt-actions', 'display', 'gap', 'margin-top'), c('.cmt-act', 'font-size', 'font-weight', 'color')]
        },
        {
            id: 'high-sidebar', name: '사이드바 내비',
            html:
`<nav class="sb">
    <a class="sb-item is-active">${icon('folder', 'sb-ic')}<span class="sb-label">프로젝트</span></a>
    <a class="sb-item">${icon('user', 'sb-ic')}<span class="sb-label">팀</span></a>
    <a class="sb-item">${icon('settings', 'sb-ic')}<span class="sb-label">설정</span></a>
</nav>`,
            answerCss:
`.sb { width: 220px; padding: 8px; background: #fff; border: 1px solid #eceff3; border-radius: 14px; display: flex; flex-direction: column; gap: 2px; }
.sb-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #4b5563; }
.sb-item.is-active { background: #eef2ff; color: #4338ca; }
.sb-ic { width: 18px; height: 18px; }
.sb-label { font-size: 14px; font-weight: 600; }`,
            palette: ['#FFFFFF', '#ECEFF3', '#4B5563', '#EEF2FF', '#4338CA'],
            check: [c('.sb', 'padding-top', 'background-color', 'border-radius', 'display', 'flex-direction', 'gap'),
                c('.sb-item', 'display', 'align-items', 'gap', 'padding-top', 'border-radius', 'color'),
                c('.sb-item.is-active', 'background-color', 'color'),
                c('.sb-ic', 'width', 'height'), c('.sb-label', 'font-size', 'font-weight')]
        },
        {
            id: 'high-formfield', name: '폼 필드 (에러)',
            html:
`<div class="ff">
    <label class="ff-label">이메일</label>
    <input class="ff-input" value="not-an-email">
    <p class="ff-error">유효한 이메일 주소를 입력하세요.</p>
</div>`,
            answerCss:
`.ff { display: flex; flex-direction: column; gap: 6px; width: 320px; }
.ff-label { font-size: 13px; font-weight: 600; color: #374151; }
.ff-input { padding: 10px 12px; border: 1px solid #ef4444; border-radius: 8px; font-size: 14px; color: #111827; }
.ff-error { margin: 0; font-size: 12px; color: #dc2626; }`,
            palette: ['#374151', '#EF4444', '#111827', '#DC2626'],
            check: [c('.ff', 'display', 'flex-direction', 'gap'),
                c('.ff-label', 'font-size', 'font-weight', 'color'),
                c('.ff-input', 'padding-top', 'border-top-color', 'border-top-width', 'border-radius', 'font-size', 'color'),
                c('.ff-error', 'font-size', 'color')]
        },
        {
            id: 'high-tablerow', name: '테이블 행',
            html:
`<table class="tb"><tbody>
    <tr class="tb-row">
        <td class="tb-cell tb-name">주문 #1042</td>
        <td class="tb-cell"><span class="tb-badge">배송 중</span></td>
        <td class="tb-cell tb-amount">₩48,000</td>
    </tr>
</tbody></table>`,
            answerCss:
`.tb { border-collapse: collapse; width: 460px; }
.tb-cell { padding: 14px 16px; border-bottom: 1px solid #eceff3; font-size: 14px; color: #374151; }
.tb-name { font-weight: 600; color: #111827; }
.tb-amount { text-align: right; font-weight: 700; color: #111827; }
.tb-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; }`,
            palette: ['#ECEFF3', '#374151', '#111827', '#DBEAFE', '#1E40AF'],
            check: [c('.tb-cell', 'padding-top', 'border-bottom-width', 'border-bottom-color', 'font-size', 'color'),
                c('.tb-name', 'font-weight', 'color'), c('.tb-amount', 'text-align', 'font-weight', 'color'),
                c('.tb-badge', 'background-color', 'color', 'font-size', 'font-weight', 'border-radius')]
        },
        {
            id: 'high-modal', name: '모달 헤더/푸터',
            html:
`<div class="md">
    <header class="md-head">
        <h2 class="md-title">프로젝트 삭제</h2>
        ${icon('x', 'md-close')}
    </header>
    <p class="md-body">이 작업은 되돌릴 수 없습니다. 계속할까요?</p>
    <footer class="md-foot">
        <button class="md-btn">취소</button>
        <button class="md-btn md-btn-danger">삭제</button>
    </footer>
</div>`,
            answerCss:
`.md { width: 420px; background: #fff; border-radius: 16px; padding: 20px; }
.md-head { display: flex; align-items: center; justify-content: space-between; }
.md-title { margin: 0; font-size: 17px; font-weight: 700; color: #111827; }
.md-close { width: 18px; height: 18px; color: #9ca3af; cursor: pointer; }
.md-body { margin: 12px 0 0; font-size: 14px; color: #6b7280; }
.md-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.md-btn { border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; }
.md-btn.md-btn-danger { background: #dc2626; border-color: #dc2626; color: #fff; }`,
            palette: ['#FFFFFF', '#111827', '#9CA3AF', '#6B7280', '#D1D5DB', '#DC2626'],
            check: [c('.md', 'padding-top', 'background-color', 'border-radius'),
                c('.md-head', 'display', 'align-items', 'justify-content'),
                c('.md-title', 'font-size', 'font-weight', 'color'), c('.md-close', 'width', 'color'),
                c('.md-body', 'font-size', 'color', 'margin-top'),
                c('.md-foot', 'display', 'justify-content', 'gap', 'margin-top'),
                c('.md-btn', 'padding-left', 'border-radius', 'color'),
                c('.md-btn.md-btn-danger', 'background-color', 'color')]
        },
        {
            id: 'high-calendar', name: '캘린더 셀',
            html:
`<div class="cal">
    <div class="cal-cell">12</div>
    <div class="cal-cell cal-today">13</div>
    <div class="cal-cell">14<span class="cal-mark"></span></div>
</div>`,
            answerCss:
`.cal { display: flex; gap: 8px; }
.cal-cell { position: relative; width: 44px; height: 44px; border-radius: 10px; background: #f9fafb; color: #374151; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.cal-cell.cal-today { background: #4f46e5; color: #fff; }
.cal-mark { position: absolute; bottom: 6px; width: 4px; height: 4px; border-radius: 999px; background: #ef4444; }`,
            palette: ['#F9FAFB', '#374151', '#4F46E5', '#EF4444'],
            check: [c('.cal', 'display', 'gap'),
                c('.cal-cell', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.cal-cell.cal-today', 'background-color', 'color'),
                c('.cal-mark', 'width', 'height', 'border-radius', 'background-color')]
        },
        {
            id: 'high-dropdown', name: '드롭다운 항목',
            html:
`<ul class="dd">
    <li class="dd-item">${icon('user', 'dd-ic')}<span class="dd-label">프로필</span></li>
    <li class="dd-item">${icon('settings', 'dd-ic')}<span class="dd-label">설정</span></li>
    <li class="dd-item dd-danger">${icon('trash', 'dd-ic')}<span class="dd-label">삭제</span></li>
</ul>`,
            answerCss:
`.dd { list-style: none; margin: 0; padding: 6px; width: 200px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
.dd-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; color: #374151; cursor: pointer; }
.dd-item.dd-danger { color: #dc2626; }
.dd-ic { width: 16px; height: 16px; }
.dd-label { font-size: 14px; font-weight: 500; }`,
            palette: ['#FFFFFF', '#E5E7EB', '#374151', '#DC2626'],
            check: [c('.dd', 'padding-top', 'background-color', 'border-top-width', 'border-radius'),
                c('.dd-item', 'display', 'align-items', 'gap', 'padding-top', 'border-radius', 'color'),
                c('.dd-item.dd-danger', 'color'), c('.dd-ic', 'width', 'height'), c('.dd-label', 'font-size', 'font-weight')]
        },
        {
            id: 'high-product', name: '상품 카드',
            html:
`<article class="prod">
    <div class="prod-img">${icon('image', 'prod-img-ic')}</div>
    <div class="prod-info">
        <div class="prod-text">
            <p class="prod-name">미니멀 데스크 램프</p>
            <p class="prod-price">₩39,000</p>
        </div>
        <button class="prod-add">${icon('plus', 'prod-add-ic')}</button>
    </div>
</article>`,
            answerCss:
`.prod { width: 260px; background: #fff; border: 1px solid #eceff3; border-radius: 16px; overflow: hidden; }
.prod-img { height: 140px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
.prod-img-ic { width: 32px; height: 32px; color: #9ca3af; }
.prod-info { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; }
.prod-name { margin: 0; font-size: 14px; font-weight: 600; color: #111827; }
.prod-price { margin: 2px 0 0; font-size: 15px; font-weight: 800; color: #111827; }
.prod-add { flex-shrink: 0; width: 36px; height: 36px; border: 0; border-radius: 999px; background: #111827; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.prod-add-ic { width: 18px; height: 18px; }`,
            palette: ['#FFFFFF', '#ECEFF3', '#F3F4F6', '#9CA3AF', '#111827'],
            check: [c('.prod', 'background-color', 'border-top-width', 'border-radius'),
                c('.prod-img', 'height', 'background-color', 'align-items'), c('.prod-img-ic', 'width', 'color'),
                c('.prod-info', 'display', 'align-items', 'justify-content', 'padding-top'),
                c('.prod-name', 'font-size', 'font-weight', 'color'), c('.prod-price', 'font-size', 'font-weight', 'color'),
                c('.prod-add', 'width', 'height', 'border-radius', 'background-color', 'color')]
        },
        {
            id: 'high-bannercta', name: '배너 CTA',
            html:
`<div class="bn">
    <div class="bn-text">
        <p class="bn-title">14일 무료 체험을 시작하세요</p>
        <p class="bn-sub">신용카드 없이 모든 기능을 사용해 보세요.</p>
    </div>
    <button class="bn-btn">시작하기 ${icon('arrowRight', 'bn-btn-ic')}</button>
</div>`,
            answerCss:
`.bn { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 24px 28px; background: #4f46e5; border-radius: 16px; width: 560px; }
.bn-title { margin: 0; font-size: 18px; font-weight: 700; color: #fff; }
.bn-sub { margin: 4px 0 0; font-size: 13px; color: #c7d2fe; }
.bn-btn { display: inline-flex; align-items: center; gap: 8px; border: 0; padding: 12px 20px; border-radius: 10px; background: #fff; font-size: 14px; font-weight: 700; color: #4f46e5; cursor: pointer; white-space: nowrap; }
.bn-btn-ic { width: 16px; height: 16px; }`,
            palette: ['#4F46E5', '#FFFFFF', '#C7D2FE'],
            check: [c('.bn', 'display', 'align-items', 'justify-content', 'gap', 'padding-top', 'background-color', 'border-radius'),
                c('.bn-title', 'font-size', 'font-weight', 'color'), c('.bn-sub', 'font-size', 'color', 'margin-top'),
                c('.bn-btn', 'display', 'align-items', 'gap', 'padding-left', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.bn-btn-ic', 'width', 'height')]
        },
        {
            id: 'high-dashtile', name: '대시보드 타일',
            html:
`<div class="dt">
    <div class="dt-head">
        <span class="dt-label">월 매출</span>
        ${icon('external', 'dt-link')}
    </div>
    <p class="dt-value">₩8.42M</p>
    <p class="dt-trend">지난달 대비 +6.1%</p>
</div>`,
            answerCss:
`.dt { width: 260px; padding: 20px; background: #fff; border: 1px solid #eceff3; border-radius: 16px; }
.dt-head { display: flex; align-items: center; justify-content: space-between; }
.dt-label { font-size: 13px; font-weight: 600; color: #6b7280; }
.dt-link { width: 14px; height: 14px; color: #cbd5e1; }
.dt-value { margin: 12px 0 0; font-size: 28px; font-weight: 800; color: #0f172a; }
.dt-trend { margin: 4px 0 0; font-size: 12px; font-weight: 600; color: #16a34a; }`,
            palette: ['#FFFFFF', '#ECEFF3', '#6B7280', '#CBD5E1', '#0F172A', '#16A34A'],
            check: [c('.dt', 'padding-top', 'background-color', 'border-top-width', 'border-radius'),
                c('.dt-head', 'display', 'align-items', 'justify-content'),
                c('.dt-label', 'font-size', 'font-weight', 'color'), c('.dt-link', 'width', 'color'),
                c('.dt-value', 'font-size', 'font-weight', 'color', 'margin-top'),
                c('.dt-trend', 'font-size', 'font-weight', 'color')]
        },
        {
            id: 'high-userrow', name: '유저 목록 행',
            html:
`<div class="ur">
    <span class="ur-avatar">S</span>
    <div class="ur-info">
        <p class="ur-name">서다인</p>
        <p class="ur-email">dain@acme.io</p>
    </div>
    <span class="ur-role">관리자</span>
    <button class="ur-more">${icon('settings', 'ur-more-ic')}</button>
</div>`,
            answerCss:
`.ur { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eceff3; width: 480px; }
.ur-avatar { width: 38px; height: 38px; border-radius: 999px; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.ur-info { flex: 1; }
.ur-name { margin: 0; font-size: 14px; font-weight: 600; color: #111827; }
.ur-email { margin: 2px 0 0; font-size: 12px; color: #9ca3af; }
.ur-role { padding: 3px 10px; border-radius: 999px; background: #f3f4f6; font-size: 12px; font-weight: 600; color: #4b5563; }
.ur-more { border: 0; background: transparent; color: #9ca3af; cursor: pointer; }
.ur-more-ic { width: 18px; height: 18px; }`,
            palette: ['#ECEFF3', '#10B981', '#111827', '#9CA3AF', '#F3F4F6', '#4B5563'],
            check: [c('.ur', 'display', 'align-items', 'gap', 'padding-top', 'border-bottom-width', 'border-bottom-color'),
                c('.ur-avatar', 'width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'),
                c('.ur-name', 'font-size', 'font-weight', 'color'), c('.ur-email', 'font-size', 'color'),
                c('.ur-role', 'padding-left', 'border-radius', 'background-color', 'font-size', 'font-weight', 'color'),
                c('.ur-more-ic', 'width', 'height')]
        },
        {
            id: 'high-notifcenter', name: '알림 센터 항목',
            html:
`<div class="nc nc-unread">
    <span class="nc-dot"></span>
    <span class="nc-icon">${icon('mail', 'nc-icon-svg')}</span>
    <div class="nc-body">
        <p class="nc-text"><strong class="nc-who">이레</strong> 님이 회원님을 멘션했습니다.</p>
        <p class="nc-time">방금 전</p>
    </div>
</div>`,
            answerCss:
`.nc { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; border-radius: 12px; width: 400px; }
.nc.nc-unread { background: #eff6ff; }
.nc-dot { width: 8px; height: 8px; margin-top: 6px; border-radius: 999px; background: #3b82f6; flex-shrink: 0; }
.nc-icon { width: 32px; height: 32px; border-radius: 8px; background: #dbeafe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nc-icon-svg { width: 16px; height: 16px; color: #2563eb; }
.nc-text { margin: 0; font-size: 13px; color: #1f2937; }
.nc-who { font-weight: 700; }
.nc-time { margin: 2px 0 0; font-size: 12px; color: #9ca3af; }`,
            palette: ['#EFF6FF', '#3B82F6', '#DBEAFE', '#2563EB', '#1F2937', '#9CA3AF'],
            check: [c('.nc', 'display', 'align-items', 'gap', 'padding-top', 'border-radius'),
                c('.nc.nc-unread', 'background-color'),
                c('.nc-dot', 'width', 'height', 'border-radius', 'background-color'),
                c('.nc-icon', 'width', 'height', 'border-radius', 'background-color'),
                c('.nc-icon-svg', 'width', 'color'),
                c('.nc-text', 'font-size', 'color'), c('.nc-who', 'font-weight'), c('.nc-time', 'font-size', 'color')]
        }
    ]
};

// 정답 CSS를 "컴포넌트 루트부터 잡는" 형태로 자동 변환 (권장 패턴 시연 + par 채점)
function rootOf(html) {
    const m = html.match(/class="([^"\s]+)/);
    return m ? m[1] : '';
}
function anchorCss(css, root) {
    if (!root) return css;
    return css.split('\n').map((line) => {
        const m = line.match(/^(\s*)([^{}]+)\{(.*)$/);
        if (!m) return line;
        const [, ws, selGroup, rest] = m;
        const sels = selGroup.split(',').map((s) => s.trim()).filter(Boolean).map((sel) => {
            if (sel === `.${root}`
                || sel.startsWith(`.${root}.`)
                || sel.startsWith(`.${root} `)
                || sel.startsWith(`.${root}:`)
                || sel.startsWith(`.${root}[`)) return sel;
            return `.${root} ${sel}`;
        });
        return `${ws}${sels.join(', ')} {${rest}`;
    }).join('\n');
}
for (const diff of Object.keys(BATTLE_POOLS)) {
    for (const p of BATTLE_POOLS[diff]) {
        p.root = rootOf(p.html);
        p.answerCss = anchorCss(p.answerCss, p.root);
    }
}

const lastShownId = { low: null, mid: null, high: null };

export function nextBattleProblem(difficulty) {
    const pool = BATTLE_POOLS[difficulty];
    const candidates = pool.length > 1 ? pool.filter((p) => p.id !== lastShownId[difficulty]) : pool;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    lastShownId[difficulty] = picked.id;
    return picked;
}

// 목표 시안용: 클래스명을 난독화해 정답 셀렉터를 감춘다 (레이아웃은 정답과 동일하게 유지)
export function obfuscatedShown(problem) {
    const map = new Map();
    const hashed = (token) => {
        if (!map.has(token)) map.set(token, `s${map.size}${Math.random().toString(36).slice(2, 6)}`);
        return map.get(token);
    };
    const html = problem.html.replace(/class="([^"]+)"/g, (_, cls) =>
        `class="${cls.trim().split(/\s+/).map(hashed).join(' ')}"`);
    let css = problem.answerCss;
    for (const [token, h] of map) {
        css = css.replace(new RegExp(`\\.${token.replace(/-/g, '\\-')}(?![\\w-])`, 'g'), `.${h}`);
    }
    return previewDoc(html, css);
}
