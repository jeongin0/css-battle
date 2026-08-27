// 타자연습 목표 문자열 풀 — 그대로 정확히 타이핑하는 용도.
// 난이도 구분 없이 한 스트림. 클래스 하나짜리 같은 너무 쉬운 건 넣지 않는다(최소 3토큰 이상 / 복합 선택자).

export const TYPING_DRILLS = [
    '.card > .title + .desc',
    'nav ul li:first-child a',
    '.grid .cell:nth-child(2n)',
    'input:not([disabled]):focus',
    'article > header h1 + p',
    'ul li:last-child::after',
    '.menu > li:hover > .submenu',
    'a[href^="https://"]::after',
    'img[src$=".png"], img[src$=".webp"]',
    'tr:nth-of-type(odd) td:first-child',
    '.list .item ~ .item',
    'button[type="submit"]:disabled',
    '.form .field input[type="email"]',
    'section > p:first-of-type',
    '.card:not(.featured) .price',
    'h2 + p, h3 + p',
    '[data-state="open"] .panel',
    '.table th:first-child, .table td:first-child',
    'input[type="checkbox"]:checked + label',
    '.gallery figure:hover img',
    '.tabs [role="tab"][aria-selected="true"]',
    '.dropdown:focus-within > .menu',
    'ul.breadcrumb li + li::before',
    '.field input:placeholder-shown ~ .hint',
    '.sidebar nav a:not(.active):hover',
    'main > section:nth-of-type(2) > h2',
    '.chip .chip-close, .chip .chip-icon',
    'label:has(> input:checked)',
    '[data-role="row"] > [data-role="cell"]:last-child',
    '.card > .title, .card .meta { color: #1f2937; font-weight: 600; }',
    'nav a:hover, nav a:focus-visible { text-decoration: underline; }',
    '.grid > .cell:nth-of-type(3n) { margin-right: 24px; }',
    '.list li:not(:last-child) { border-bottom: 1px solid #e5e7eb; }',
    'button:disabled { opacity: 0.5; cursor: not-allowed; }',
    '[data-open] .panel::before { content: "▾"; transform: rotate(180deg); }',
    '.table tbody tr:hover td { background: #f9fafb; }',
    'input[type="radio"]:checked + label::before { border-color: #4f46e5; }',
    'a[target="_blank"]::after { content: "↗"; margin-left: 4px; }',
    '.breadcrumb li:not(:first-child)::before { content: "/"; margin: 0 8px; }',
    '.avatar-group > .avatar:not(:first-child) { margin-left: -8px; }'
];

let lastIdx = -1;

export function nextDrill() {
    let i = Math.floor(Math.random() * TYPING_DRILLS.length);
    if (i === lastIdx) i = (i + 1) % TYPING_DRILLS.length;
    lastIdx = i;
    return TYPING_DRILLS[i];
}
