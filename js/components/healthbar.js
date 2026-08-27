// 배틀 모드 체력바 컴포넌트

export function healthBarHtml(label, percent = 100) {
    const clamped = Math.max(0, Math.min(100, percent));
    const lowClass = clamped <= 30 ? ' is-low' : '';
    return `
        <div class="health-bar-block">
            <span class="health-bar-label">${label}</span>
            <div class="health-bar">
                <span class="health-bar-fill${lowClass}" style="width:${clamped}%"></span>
            </div>
        </div>
    `;
}

export function setHealth(blockEl, percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    const fill = blockEl.querySelector('.health-bar-fill');
    if (!fill) return;
    fill.style.width = `${clamped}%`;
    fill.classList.toggle('is-low', clamped <= 30);
}
