// 타자연습 목표 문자열 풀 — 그대로 정확히 타이핑하는 용도.
// 난이도 구분 없이 한 스트림. 클래스 하나짜리 같은 너무 쉬운 건 넣지 않는다(최소 3토큰 이상 / 복합 선택자).
// tip: 그 선택자가 "무엇을 고르는지" 한 줄 설명 (체화 목적).

export const TYPING_DRILLS = [
    { text: '.card > .title + .desc', tip: '.card 의 직계 자식(>) .title, 그 바로 다음 형제(+) .desc' },
    { text: 'nav ul li:first-child a', tip: 'nav 안 ul 의 첫 번째 li 안에 있는 a' },
    { text: '.grid .cell:nth-child(2n)', tip: '.grid 안에서 짝수 번째(2n) .cell' },
    { text: 'input:not([disabled]):focus', tip: 'disabled 속성이 없고 지금 포커스된 input' },
    { text: 'article > header h1 + p', tip: 'article 직계 header 안 h1 의 바로 다음 형제 p' },
    { text: 'ul li:last-child::after', tip: 'ul 의 마지막 li 뒤에 생성되는 가상 요소' },
    { text: '.menu > li:hover > .submenu', tip: '.menu 직계 li 에 마우스를 올렸을 때 그 직계 .submenu' },
    { text: 'a[href^="https://"]::after', tip: 'href 가 https:// 로 시작하는 a 뒤 가상 요소' },
    { text: 'img[src$=".png"], img[src$=".webp"]', tip: 'src 가 .png 또는 .webp 로 끝나는 img (다중 선택자)' },
    { text: 'tr:nth-of-type(odd) td:first-child', tip: '홀수 번째 tr 안의 첫 번째 td' },
    { text: '.list .item ~ .item', tip: '.item 앞에 다른 .item 이 있는 경우(일반 형제 ~)' },
    { text: 'button[type="submit"]:disabled', tip: 'type 이 submit 이면서 비활성화된 button' },
    { text: '.form .field input[type="email"]', tip: '.field 안의 이메일 입력칸' },
    { text: 'section > p:first-of-type', tip: 'section 직계 자식 중 첫 번째 p' },
    { text: '.card:not(.featured) .price', tip: '.featured 가 아닌 .card 안의 .price' },
    { text: 'h2 + p, h3 + p', tip: 'h2 또는 h3 바로 다음의 p (다중 선택자)' },
    { text: '[data-state="open"] .panel', tip: 'data-state 가 open 인 요소 안의 .panel' },
    { text: '.table th:first-child, .table td:first-child', tip: '표의 각 행 첫 칸 (th·td 모두)' },
    { text: 'input[type="checkbox"]:checked + label', tip: '체크된 체크박스 바로 다음의 label' },
    { text: '.gallery figure:hover img', tip: 'figure 에 호버했을 때 그 안의 img' },
    { text: '.tabs [role="tab"][aria-selected="true"]', tip: '선택된 탭(aria-selected=true)' },
    { text: '.dropdown:focus-within > .menu', tip: '.dropdown 내부에 포커스가 있을 때 직계 .menu' },
    { text: 'ul.breadcrumb li + li::before', tip: '첫 항목을 제외한 각 li 앞의 구분자 가상 요소' },
    { text: '.field input:placeholder-shown ~ .hint', tip: 'placeholder 만 보이는(미입력) input 뒤의 .hint' },
    { text: '.sidebar nav a:not(.active):hover', tip: '.active 가 아닌 사이드바 링크에 호버' },
    { text: 'main > section:nth-of-type(2) > h2', tip: 'main 의 두 번째 section 직계 h2' },
    { text: '.chip .chip-close, .chip .chip-icon', tip: '칩의 닫기 버튼과 아이콘 (다중 선택자)' },
    { text: 'label:has(> input:checked)', tip: '체크된 input 을 직계로 가진 label (:has)' },
    { text: '[data-role="row"] > [data-role="cell"]:last-child', tip: '행의 마지막 셀' },
    { text: '.card > .title, .card .meta { color: #1f2937; font-weight: 600; }', tip: '선언부까지 포함한 규칙 전체 타이핑' },
    { text: 'nav a:hover, nav a:focus-visible { text-decoration: underline; }', tip: '호버·키보드 포커스 모두에 밑줄 (규칙 전체)' },
    { text: '.grid > .cell:nth-of-type(3n) { margin-right: 24px; }', tip: '3의 배수 번째 .cell 에 오른쪽 여백 (규칙 전체)' },
    { text: '.list li:not(:last-child) { border-bottom: 1px solid #e5e7eb; }', tip: '마지막을 제외한 항목에 아래 구분선 (규칙 전체)' },
    { text: 'button:disabled { opacity: 0.5; cursor: not-allowed; }', tip: '비활성 버튼 흐리게 + 커서 (규칙 전체)' },
    { text: '[data-open] .panel::before { content: "▾"; transform: rotate(180deg); }', tip: '열린 상태의 화살표 회전 (규칙 전체)' },
    { text: '.table tbody tr:hover td { background: #f9fafb; }', tip: '행 호버 시 배경 (규칙 전체)' },
    { text: 'input[type="radio"]:checked + label::before { border-color: #4f46e5; }', tip: '선택된 라디오의 커스텀 표식 색 (규칙 전체)' },
    { text: 'a[target="_blank"]::after { content: "↗"; margin-left: 4px; }', tip: '새 탭 링크 뒤 아이콘 (규칙 전체)' },
    { text: '.breadcrumb li:not(:first-child)::before { content: "/"; margin: 0 8px; }', tip: '브레드크럼 구분자 (규칙 전체)' },
    { text: '.avatar-group > .avatar:not(:first-child) { margin-left: -8px; }', tip: '겹치는 아바타 음수 여백 (규칙 전체)' }
];

let lastIdx = -1;

export function nextDrill() {
    let i = Math.floor(Math.random() * TYPING_DRILLS.length);
    if (i === lastIdx) i = (i + 1) % TYPING_DRILLS.length;
    lastIdx = i;
    return TYPING_DRILLS[i];
}
