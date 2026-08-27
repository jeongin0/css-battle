// 배틀 모드 문제 데이터 (Layer 6 problemGenerator로 대체되기 전까지의 임시 큐레이션 세트)

export const BATTLE_PROBLEMS = {
    low: {
        id: 'low-01',
        difficulty: 'low',
        domHtml: '<div class="card">\n  <h2 class="title">카드 제목</h2>\n</div>',
        opponentRule: '.card h2 { color: #FF2E63; }',
        targetExtraRule: '.card .title { color: #00E5FF; }',
        hint: 'ID는 학생증처럼 유일해서 클래스 여러 개보다 셉니다. 여기서는 클래스 개수로 승부하세요.'
    },
    mid: {
        id: 'mid-01',
        difficulty: 'mid',
        domHtml: '<div class="panel">\n  <div class="card active">\n    <p class="desc">설명 텍스트</p>\n  </div>\n</div>',
        opponentRule: '.panel .card p { color: #FF2E63; }',
        targetExtraRule: '.card.active .desc { color: #00E5FF; }',
        hint: '태그 셀렉터보다 클래스 셀렉터가 셉니다. 클래스 개수를 늘려서 이겨보세요.'
    },
    high: {
        id: 'high-01',
        difficulty: 'high',
        domHtml: '<article class="post">\n  <header class="post-header">\n    <h1 id="title" class="post-title">제목</h1>\n  </header>\n</article>',
        opponentRule: '#title { color: #FF2E63 !important; }',
        targetExtraRule: '#title.post-title { color: #00E5FF !important; }',
        hint: '!important끼리는 다시 특이도로 승부합니다. 같은 ID라도 클래스를 더 붙이면 이길 수 있어요.'
    }
};
