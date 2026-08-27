// 배틀 모드 시안 풀 — 난이도별 큐레이션.
// html: 스타일 없는 구조 / answerCss: 정답(시안 렌더 + 채점 기준) / check: 검증 대상
// palette: 색상 스와치 / keepDefault: 스타일이 새면 안 되는 요소

const COMMON_HEAD = `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 20px; font-family: 'Pretendard', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background: #f4f4f6; }`;

export function previewDoc(html, css) {
    return `<!doctype html><html><head><style>${COMMON_HEAD}\n${css || ''}</style></head><body>${html}</body></html>`;
}

const BOX = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
const TEXT = ['color', 'font-size', 'font-weight'];

export const BATTLE_POOLS = {
    low: [
        {
            id: 'low-profile',
            name: '프로필 뱃지',
            html:
`<div class="profile">
    <span class="profile-avatar">A</span>
    <span class="profile-name">Ada Lovelace</span>
    <span class="profile-role">Engineer</span>
</div>`,
            answerCss:
`.profile { display: flex; align-items: center; gap: 12px; padding: 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; width: 320px; }
.profile-avatar { width: 40px; height: 40px; border-radius: 999px; background: #4f46e5; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.profile-name { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; }
.profile-role { font-size: 13px; color: #6b7280; margin-left: auto; white-space: nowrap; }`,
            palette: ['#4F46E5', '#111827', '#6B7280', '#E5E7EB', '#FFFFFF'],
            check: [
                { sel: '.profile', props: ['display', 'align-items', 'gap', ...BOX, 'background-color', 'border-radius'] },
                { sel: '.profile-avatar', props: ['width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'] },
                { sel: '.profile-name', props: TEXT },
                { sel: '.profile-role', props: ['color', 'font-size'] }
            ],
            keepDefault: []
        },
        {
            id: 'low-stat',
            name: '지표 카드',
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
            check: [
                { sel: '.stat', props: [...BOX, 'background-color', 'border-radius'] },
                { sel: '.stat-value', props: ['font-size', 'font-weight', 'color', 'margin-top', 'margin-bottom'] },
                { sel: '.stat-label', props: ['font-size', 'color'] },
                { sel: '.stat-delta', props: ['font-size', 'font-weight', 'color', 'margin-top'] }
            ],
            keepDefault: []
        },
        {
            id: 'low-notice',
            name: '안내 배너',
            html:
`<p class="notice">
    <span class="notice-icon">i</span>
    변경 사항은 자동으로 저장됩니다.
</p>`,
            answerCss:
`.notice { display: flex; align-items: center; gap: 10px; margin: 0; padding: 12px 16px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; font-size: 14px; color: #1e3a8a; width: 360px; }
.notice-icon { width: 20px; height: 20px; border-radius: 999px; background: #3b82f6; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-style: normal; flex-shrink: 0; }`,
            palette: ['#EFF6FF', '#3B82F6', '#1E3A8A', '#FFFFFF'],
            check: [
                { sel: '.notice', props: ['display', 'align-items', 'gap', ...BOX, 'background-color', 'border-left-width', 'border-left-color', 'border-radius', 'font-size', 'color'] },
                { sel: '.notice-icon', props: ['width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'] }
            ],
            keepDefault: []
        },
        {
            id: 'low-price',
            name: '가격 표시',
            html:
`<p class="price">
    <span class="price-currency">₩</span>
    <span class="price-amount">12,000</span>
    <span class="price-period">/ 월</span>
</p>`,
            answerCss:
`.price { margin: 0; display: flex; align-items: baseline; gap: 4px; color: #111827; }
.price-currency { font-size: 18px; font-weight: 600; }
.price-amount { font-size: 36px; font-weight: 800; letter-spacing: -0.02em; }
.price-period { font-size: 14px; font-weight: 500; color: #9ca3af; }`,
            palette: ['#111827', '#9CA3AF'],
            check: [
                { sel: '.price', props: ['display', 'align-items', 'gap', 'color'] },
                { sel: '.price-currency', props: ['font-size', 'font-weight'] },
                { sel: '.price-amount', props: ['font-size', 'font-weight'] },
                { sel: '.price-period', props: ['font-size', 'font-weight', 'color'] }
            ],
            keepDefault: []
        }
    ],
    mid: [
        {
            id: 'mid-segmented',
            name: '세그먼트 컨트롤',
            html:
`<div class="seg">
    <button class="seg-item">일간</button>
    <button class="seg-item is-active">주간</button>
    <button class="seg-item">월간</button>
</div>`,
            answerCss:
`.seg { display: inline-flex; gap: 4px; padding: 4px; background: #f1f5f9; border-radius: 10px; }
.seg-item { border: 0; padding: 8px 16px; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; }
.seg-item.is-active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }`,
            palette: ['#F1F5F9', '#64748B', '#0F172A', '#FFFFFF'],
            check: [
                { sel: '.seg', props: ['display', 'gap', ...BOX, 'background-color', 'border-radius'] },
                { sel: '.seg-item', props: ['padding-top', 'padding-left', 'border-radius', 'font-size', 'font-weight', 'color'] },
                { sel: '.seg-item.is-active', props: ['background-color', 'color'] }
            ],
            keepDefault: []
        },
        {
            id: 'mid-todo',
            name: '할 일 항목',
            html:
`<ul class="todo">
    <li class="todo-item">보고서 초안 작성</li>
    <li class="todo-item is-done">회의실 예약</li>
</ul>`,
            answerCss:
`.todo { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; width: 320px; }
.todo-item { padding: 12px 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #111827; }
.todo-item.is-done { color: #9ca3af; text-decoration: line-through; background: #f9fafb; }`,
            palette: ['#FFFFFF', '#E5E7EB', '#111827', '#9CA3AF', '#F9FAFB'],
            check: [
                { sel: '.todo', props: ['display', 'flex-direction', 'gap', ...BOX] },
                { sel: '.todo-item', props: [...BOX, 'background-color', 'border-top-width', 'border-radius', 'font-size', 'color'] },
                { sel: '.todo-item.is-done', props: ['color', 'text-decoration-line', 'background-color'] }
            ],
            keepDefault: []
        },
        {
            id: 'mid-tags',
            name: '태그 목록',
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
            check: [
                { sel: '.tags', props: ['display', 'gap'] },
                { sel: '.tag', props: ['padding-top', 'padding-left', 'border-radius', 'background-color', 'font-size', 'font-weight', 'color'] },
                { sel: '.tag.tag-primary', props: ['background-color', 'color'] }
            ],
            keepDefault: []
        },
        {
            id: 'mid-media',
            name: '미디어 카드',
            html:
`<article class="media">
    <div class="media-thumb"></div>
    <div class="media-body">
        <h3 class="media-title">디자인 시스템 구축기</h3>
        <p class="media-desc">토큰부터 컴포넌트까지</p>
        <span class="media-meta">5분 읽기</span>
    </div>
</article>`,
            answerCss:
`.media { display: flex; gap: 16px; padding: 16px; background: #ffffff; border: 1px solid #eceff3; border-radius: 14px; width: 420px; }
.media-thumb { flex: 0 0 96px; height: 96px; border-radius: 10px; background: #e0e7ff; }
.media-body { display: flex; flex-direction: column; gap: 4px; }
.media-title { margin: 0; font-size: 16px; font-weight: 700; color: #111827; }
.media-desc { margin: 0; font-size: 13px; color: #6b7280; }
.media-meta { margin-top: auto; font-size: 12px; color: #9ca3af; }`,
            palette: ['#FFFFFF', '#ECEFF3', '#E0E7FF', '#111827', '#6B7280', '#9CA3AF'],
            check: [
                { sel: '.media', props: ['display', 'gap', ...BOX, 'background-color', 'border-radius'] },
                { sel: '.media-thumb', props: ['height', 'border-radius', 'background-color'] },
                { sel: '.media-body', props: ['display', 'flex-direction', 'gap'] },
                { sel: '.media-title', props: TEXT },
                { sel: '.media-desc', props: ['font-size', 'color'] },
                { sel: '.media-meta', props: ['font-size', 'color'] }
            ],
            keepDefault: []
        }
    ],
    high: [
        {
            id: 'high-header',
            name: '사이트 헤더',
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
.hd-logo { font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 0.02em; }
.hd-nav { display: flex; gap: 20px; }
.hd-link { font-size: 14px; color: #9aa4b2; text-decoration: none; }
.hd-link.hd-link-current { color: #ffffff; font-weight: 700; }
.hd-cta { margin-left: auto; border: 0; padding: 10px 18px; border-radius: 8px; background: #6366f1; color: #ffffff; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }`,
            palette: ['#0B1020', '#FFFFFF', '#9AA4B2', '#6366F1'],
            check: [
                { sel: '.hd', props: ['display', 'align-items', 'gap', ...BOX, 'background-color'] },
                { sel: '.hd-logo', props: ['font-size', 'font-weight', 'color'] },
                { sel: '.hd-nav', props: ['display', 'gap'] },
                { sel: '.hd-link', props: ['font-size', 'color'] },
                { sel: '.hd-link.hd-link-current', props: ['color', 'font-weight'] },
                { sel: '.hd-cta', props: ['padding-top', 'padding-left', 'border-radius', 'background-color', 'color', 'font-weight'] }
            ],
            keepDefault: []
        },
        {
            id: 'high-pricing',
            name: '가격 카드 (추천)',
            html:
`<article class="pc pc-featured">
    <span class="pc-badge">추천</span>
    <h3 class="pc-name">Pro</h3>
    <p class="pc-price">₩29,000<span class="pc-per">/월</span></p>
    <ul class="pc-feats">
        <li class="pc-feat">무제한 프로젝트</li>
        <li class="pc-feat">우선 지원</li>
    </ul>
    <button class="pc-cta">선택</button>
</article>`,
            answerCss:
`.pc { padding: 24px; background: #ffffff; border: 2px solid #e5e7eb; border-radius: 16px; width: 260px; }
.pc.pc-featured { border-color: #6366f1; box-shadow: 0 12px 32px rgba(99,102,241,0.18); }
.pc-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 12px; font-weight: 700; white-space: nowrap; }
.pc-name { margin: 12px 0 0; font-size: 18px; font-weight: 700; color: #111827; }
.pc-price { margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #111827; }
.pc-per { font-size: 14px; font-weight: 500; color: #9ca3af; }
.pc-feats { list-style: none; margin: 16px 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pc-feat { font-size: 14px; color: #4b5563; }
.pc-cta { width: 100%; border: 0; padding: 12px; border-radius: 10px; background: #6366f1; color: #ffffff; font-size: 14px; font-weight: 700; cursor: pointer; }`,
            palette: ['#FFFFFF', '#6366F1', '#EEF2FF', '#4338CA', '#111827', '#9CA3AF', '#4B5563'],
            check: [
                { sel: '.pc', props: [...BOX, 'background-color', 'border-radius'] },
                { sel: '.pc.pc-featured', props: ['border-top-color', 'border-top-width'] },
                { sel: '.pc-badge', props: ['background-color', 'color', 'font-weight', 'border-radius'] },
                { sel: '.pc-name', props: TEXT },
                { sel: '.pc-price', props: ['font-size', 'font-weight', 'color'] },
                { sel: '.pc-per', props: ['font-size', 'color'] },
                { sel: '.pc-feats', props: ['display', 'flex-direction', 'gap'] },
                { sel: '.pc-feat', props: ['font-size', 'color'] },
                { sel: '.pc-cta', props: ['border-radius', 'background-color', 'color', 'font-weight'] }
            ],
            keepDefault: []
        },
        {
            id: 'high-hero',
            name: '히어로 섹션',
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
.hero-btn { border: 1px solid #d4d4d8; padding: 10px 20px; border-radius: 10px; background: #ffffff; font-size: 14px; font-weight: 600; color: #18181b; cursor: pointer; white-space: nowrap; }
.hero-btn.hero-btn-primary { background: #6366f1; border-color: #6366f1; color: #ffffff; }`,
            palette: ['#FAFAFA', '#6366F1', '#0F172A', '#64748B', '#FFFFFF', '#18181B'],
            check: [
                { sel: '.hero', props: [...BOX, 'background-color', 'border-radius', 'text-align'] },
                { sel: '.hero-eyebrow', props: ['font-size', 'font-weight', 'color'] },
                { sel: '.hero-title', props: ['font-size', 'font-weight', 'color', 'margin-top'] },
                { sel: '.hero-sub', props: ['font-size', 'color'] },
                { sel: '.hero-actions', props: ['display', 'justify-content', 'gap', 'margin-top'] },
                { sel: '.hero-btn', props: ['padding-top', 'padding-left', 'border-radius', 'background-color', 'color'] },
                { sel: '.hero-btn.hero-btn-primary', props: ['background-color', 'color'] }
            ],
            keepDefault: []
        },
        {
            id: 'high-comment',
            name: '댓글',
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
`.cmt { display: flex; gap: 12px; padding: 16px; background: #ffffff; border-radius: 12px; width: 420px; }
.cmt-avatar { width: 36px; height: 36px; border-radius: 999px; background: #f59e0b; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.cmt-head { margin: 0; display: flex; align-items: baseline; gap: 8px; }
.cmt-author { font-size: 14px; font-weight: 700; color: #111827; }
.cmt-time { font-size: 12px; color: #9ca3af; }
.cmt-body { margin: 4px 0 0; font-size: 14px; color: #374151; line-height: 1.5; }
.cmt-actions { display: flex; gap: 12px; margin-top: 8px; }
.cmt-act { border: 0; padding: 0; background: transparent; font-size: 12px; font-weight: 600; color: #6b7280; cursor: pointer; }`,
            palette: ['#FFFFFF', '#F59E0B', '#111827', '#9CA3AF', '#374151', '#6B7280'],
            check: [
                { sel: '.cmt', props: ['display', 'gap', ...BOX, 'border-radius'] },
                { sel: '.cmt-avatar', props: ['width', 'height', 'border-radius', 'background-color', 'color', 'font-weight'] },
                { sel: '.cmt-head', props: ['display', 'align-items', 'gap'] },
                { sel: '.cmt-author', props: TEXT },
                { sel: '.cmt-time', props: ['font-size', 'color'] },
                { sel: '.cmt-body', props: ['font-size', 'color', 'margin-top'] },
                { sel: '.cmt-actions', props: ['display', 'gap', 'margin-top'] },
                { sel: '.cmt-act', props: ['font-size', 'font-weight', 'color'] }
            ],
            keepDefault: []
        }
    ]
};

const lastShownId = { low: null, mid: null, high: null };

export function nextBattleProblem(difficulty) {
    const pool = BATTLE_POOLS[difficulty];
    const candidates = pool.length > 1 ? pool.filter((p) => p.id !== lastShownId[difficulty]) : pool;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    lastShownId[difficulty] = picked.id;
    return picked;
}

// 목표 시안용: 클래스명을 난독화해 정답 셀렉터를 감춘다 (레이아웃은 그대로 유지)
export function obfuscatedShown(problem) {
    const map = new Map();
    const hashed = (token) => {
        if (!map.has(token)) map.set(token, `s${map.size}x${Math.random().toString(36).slice(2, 6)}`);
        return map.get(token);
    };
    const html = problem.html.replace(/class="([^"]+)"/g, (_, cls) =>
        `class="${cls.trim().split(/\s+/).map(hashed).join(' ')}"`);
    let css = problem.answerCss;
    for (const [token, h] of map) {
        css = css.replace(new RegExp(`\\.${token.replace(/[-]/g, '\\$&')}(?![\\w-])`, 'g'), `.${h}`);
    }
    return previewDoc(html, css);
}
