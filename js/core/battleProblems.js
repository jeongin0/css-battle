// 배틀 모드 문제 풀 — 난이도별 실제 UI 컴포넌트.
// 각 문제: 상대 규칙(opponentRules)이 DOM에 이미 적용돼 시안과 다르게 보인다.
// 사용자는 상대 규칙을 특이도로 이기는 규칙을 써서 targetSelector의 렌더 결과를
// expectedStyles(정답 CSS = targetCss의 결과)와 맞춰야 한다.

export const BATTLE_POOLS = {
    low: [
        {
            id: 'low-btn',
            name: '주요 버튼 색',
            domHtml: '<div class="toolbar">\n  <button class="btn primary">저장</button>\n  <button class="btn">취소</button>\n</div>',
            opponentRules: ['.toolbar .btn { background: #6B7280; color: #fff; }'],
            targetCss: '.toolbar .btn.primary { background: #00E5FF; color: #150C22; }',
            targetSelector: '.primary',
            expectedStyles: { 'background-color': '#00E5FF', color: '#150C22' },
            hint: '.toolbar .btn (0,0,2,0)보다 세려면 클래스를 하나 더 붙이세요. .primary는 이미 버튼에 있습니다.'
        },
        {
            id: 'low-badge',
            name: 'NEW 뱃지',
            domHtml: '<p class="row">업데이트 <span class="badge new">NEW</span></p>',
            opponentRules: ['.row .badge { background: #6B7280; color: #fff; }'],
            targetCss: '.row .badge.new { background: #FFD23F; color: #150C22; }',
            targetSelector: '.new',
            expectedStyles: { 'background-color': '#FFD23F', color: '#150C22' },
            hint: '뱃지에는 badge와 new 두 클래스가 있습니다. 둘 다 쓰면 상대보다 셉니다.'
        },
        {
            id: 'low-title',
            name: '카드 제목 색',
            domHtml: '<article class="card">\n  <h3 class="card-title">주간 리포트</h3>\n  <p>이번 주 요약</p>\n</article>',
            opponentRules: ['.card h3 { color: #6B7280; }'],
            targetCss: '.card .card-title { color: #00E5FF; }',
            targetSelector: '.card-title',
            expectedStyles: { color: '#00E5FF' },
            hint: '태그(h3)보다 클래스가 셉니다. .card .card-title로 이겨보세요.'
        },
        {
            id: 'low-price',
            name: '가격 강조',
            domHtml: '<p class="plan">월 <span class="price">9,900</span>원</p>',
            opponentRules: ['.plan .price { font-size: 16px; color: #6B7280; }'],
            targetCss: '.plan span.price { font-size: 28px; color: #FFD23F; }',
            targetSelector: '.price',
            expectedStyles: { 'font-size': '28px', color: '#FFD23F' },
            hint: '태그 선택자(span)를 클래스 앞에 붙이면 (0,0,2,1)로 상대를 이깁니다.'
        }
    ],
    mid: [
        {
            id: 'mid-nav',
            name: '내비 활성 항목',
            domHtml: '<nav class="gnb">\n  <a class="gnb-link">홈</a>\n  <a class="gnb-link is-active">대시보드</a>\n  <a class="gnb-link">설정</a>\n</nav>',
            opponentRules: [
                '.gnb .gnb-link { color: #9CA3AF; font-weight: 400; }',
                '.gnb a.gnb-link { color: #9CA3AF; }'
            ],
            targetCss: '.gnb .gnb-link.is-active { color: #00E5FF; font-weight: 700; }',
            targetSelector: '.is-active',
            expectedStyles: { color: '#00E5FF', 'font-weight': '700' },
            hint: '상대 규칙 중 가장 센 것이 .gnb a.gnb-link (0,0,2,1). 여기에 .is-active를 더하면 이깁니다.'
        },
        {
            id: 'mid-alert',
            name: '성공 알림 배너',
            domHtml: '<div class="alert success">\n  <strong>저장됨</strong> 변경 사항이 반영되었습니다.\n</div>',
            opponentRules: [
                '.alert { background: #374151; color: #E5E7EB; }',
                '.alert.success { background: #4B5563; }'
            ],
            targetCss: '.alert.success { background: #123D2B; color: #4ADE80; }',
            targetSelector: '.alert.success',
            expectedStyles: { 'background-color': '#123D2B', color: '#4ADE80' },
            hint: '상대가 .alert.success (0,0,2,0)로 배경을 잡고 있습니다. 같은 특이도면 나중 규칙이 이기지만, 색까지 맞아야 합니다.'
        },
        {
            id: 'mid-desc',
            name: '카드 설명 텍스트',
            domHtml: '<section class="panel">\n  <div class="card featured">\n    <h4 class="card-title">추천</h4>\n    <p class="card-desc">가장 많이 선택하는 플랜</p>\n  </div>\n</section>',
            opponentRules: [
                '.panel .card p { color: #6B7280; }',
                '.panel .card .card-desc { color: #6B7280; }'
            ],
            targetCss: '.card.featured .card-desc { color: #F1EEFA; }',
            targetSelector: '.card-desc',
            expectedStyles: { color: '#F1EEFA' },
            hint: '상대는 .panel .card .card-desc (0,0,3,0). .card.featured .card-desc도 (0,0,3,0)이라 나중에 오면 이깁니다.'
        },
        {
            id: 'mid-outline',
            name: '아웃라인 버튼 테두리',
            domHtml: '<div class="actions">\n  <button class="btn ghost">더 보기</button>\n</div>',
            opponentRules: [
                '.actions .btn { border: 2px solid #6B7280; color: #6B7280; background: transparent; }',
                '.actions .btn.ghost { border-color: #6B7280; }'
            ],
            targetCss: '.actions .btn.ghost { border-color: #FF2E63; color: #FF2E63; }',
            targetSelector: '.ghost',
            expectedStyles: { 'border-top-color': '#FF2E63', color: '#FF2E63' },
            hint: 'border-color는 border-top-color 등으로 계산됩니다. 상대 .actions .btn.ghost (0,0,3,0)를 같은 특이도로 나중에 덮으세요.'
        }
    ],
    high: [
        {
            id: 'high-header',
            name: '헤더 로고 색 (!important)',
            domHtml: '<header class="site">\n  <a id="brand" class="logo">ACME</a>\n  <nav><a class="nav-link">문서</a></nav>\n</header>',
            opponentRules: ['#brand { color: #6B7280 !important; }'],
            targetCss: '#brand.logo { color: #FFD23F !important; }',
            targetSelector: '#brand',
            expectedStyles: { color: '#FFD23F' },
            hint: '!important끼리는 다시 특이도로 승부합니다. 같은 #brand라도 .logo를 더 붙이면 (0,1,1,0)로 이깁니다.'
        },
        {
            id: 'high-pricing',
            name: '강조 가격 카드',
            domHtml: '<ul class="pricing">\n  <li class="tier">Basic</li>\n  <li id="pro" class="tier highlight">Pro</li>\n</ul>',
            opponentRules: [
                '.pricing .tier { background: #1F2937; color: #9CA3AF; }',
                '#pro { background: #374151; }'
            ],
            targetCss: '#pro.highlight { background: #150C22; color: #00E5FF; }',
            targetSelector: '#pro',
            expectedStyles: { 'background-color': '#150C22', color: '#00E5FF' },
            hint: '배경은 #pro (0,1,0,0)가, 색은 .pricing .tier (0,0,2,0)가 잡고 있습니다. 둘 다 이기려면 #pro.highlight.'
        },
        {
            id: 'high-cta-hover',
            name: 'CTA 기본 상태 색',
            domHtml: '<div class="hero">\n  <a class="cta" href="#">시작하기</a>\n</div>',
            opponentRules: [
                '.hero a.cta { color: #9CA3AF; }',
                '.hero .cta:link { color: #9CA3AF; }'
            ],
            targetCss: '.hero a.cta:link { color: #150C22; }',
            targetSelector: '.cta',
            expectedStyles: { color: '#150C22' },
            hint: ':link는 클래스와 같은 무게입니다. .hero .cta:link (0,0,3,0)를 이기려면 태그를 더한 .hero a.cta:link (0,0,3,1).'
        },
        {
            id: 'high-nav-important',
            name: '내비 링크 색 뒤집기',
            domHtml: '<nav id="main-nav" class="menu">\n  <a class="item current">대시보드</a>\n</nav>',
            opponentRules: ['#main-nav a { color: #6B7280 !important; }'],
            targetCss: '#main-nav a.current { color: #00E5FF !important; }',
            targetSelector: '.current',
            expectedStyles: { color: '#00E5FF' },
            hint: '상대는 #main-nav a (0,1,0,1) + !important. 클래스를 더한 #main-nav a.current + !important로 이기세요.'
        }
    ]
};
