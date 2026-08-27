export function render(container) {
    container.innerHTML = `
        <section class="container landing-hero">
            <h1 class="landing-hero-headline">분명 스타일 줬는데, 왜 안 먹지?</h1>
            <p class="landing-hero-sub">CSS를 대결·타이핑·실전 진단으로 몸에 익히는 학습 도구</p>
            <a href="#battle" class="btn">지금 배틀 시작</a>
        </section>

        <section class="container landing-features">
            <article class="card">
                <h2 class="card-title">배틀</h2>
                <p>구조와 디자인 시안을 보고 CSS로 상대 규칙을 특이도로 이기며 시안을 재현합니다.</p>
            </article>
            <article class="card">
                <h2 class="card-title">타자연습</h2>
                <p>DOM 구조를 보고 조건에 맞는 셀렉터를 직접 타이핑하며 반복 연습합니다.</p>
            </article>
            <article class="card">
                <h2 class="card-title">실전 진단</h2>
                <p>실제 CSS 코드를 붙여넣고 어떤 규칙이 이기는지 우선순위를 진단합니다.</p>
            </article>
        </section>

        <section class="container landing-benefits">
            <h2>기대 효과</h2>
            <ul>
                <li>CSS 충돌 원인을 스스로 진단</li>
                <li>!important 의존도 감소</li>
                <li>캐스케이드 개념 이해</li>
            </ul>
        </section>
    `;
}
