// canvas 막대그래프 (라이브러리 없이 직접 그리기)

const COLORS = {
    axis: '#9084AE',
    grid: '#2A1B42',
    bar: '#00E5FF',
    text: '#F1EEFA'
};

// data: [{ label, value }], options: { max, unit, barColor }
export function drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 480;
    const cssH = canvas.clientHeight || 240;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const padL = 40;
    const padB = 28;
    const padT = 12;
    const plotW = cssW - padL - 12;
    const plotH = cssH - padB - padT;
    const max = options.max || Math.max(1, ...data.map((d) => d.value));
    const barColor = options.barColor || COLORS.bar;

    ctx.strokeStyle = COLORS.grid;
    ctx.fillStyle = COLORS.axis;
    ctx.font = '11px Pretendard, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
        const y = padT + plotH - (plotH * i) / steps;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
        ctx.fillText(Math.round((max * i) / steps), padL - 6, y);
    }

    if (!data.length) return;
    const slot = plotW / data.length;
    const barW = Math.min(48, slot * 0.6);
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
        const x = padL + slot * i + (slot - barW) / 2;
        const h = (d.value / max) * plotH;
        const y = padT + plotH - h;
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barW, h);
        ctx.fillStyle = COLORS.text;
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${d.value}${options.unit || ''}`, x + barW / 2, y - 2);
        ctx.fillStyle = COLORS.axis;
        ctx.textBaseline = 'top';
        ctx.fillText(d.label, x + barW / 2, padT + plotH + 6);
    });
}

// data: [{ label, value }] — 꺾은선
export function drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 480;
    const cssH = canvas.clientHeight || 240;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const padL = 40;
    const padB = 28;
    const padT = 12;
    const plotW = cssW - padL - 12;
    const plotH = cssH - padB - padT;
    const max = options.max || Math.max(1, ...data.map((d) => d.value));

    ctx.strokeStyle = COLORS.grid;
    ctx.fillStyle = COLORS.axis;
    ctx.font = '11px Pretendard, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
        const y = padT + plotH - (plotH * i) / steps;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
        ctx.fillText(Math.round((max * i) / steps), padL - 6, y);
    }

    if (data.length < 1) return;
    const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;
    const pointX = (i) => padL + stepX * i;
    const pointY = (v) => padT + plotH - (v / max) * plotH;

    ctx.strokeStyle = options.lineColor || COLORS.bar;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
        const x = pointX(i);
        const y = pointY(d.value);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = options.lineColor || COLORS.bar;
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
        const x = pointX(i);
        ctx.beginPath();
        ctx.arc(x, pointY(d.value), 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.axis;
        ctx.textBaseline = 'top';
        ctx.fillText(d.label, x, padT + plotH + 6);
        ctx.fillStyle = options.lineColor || COLORS.bar;
    });
}
