// textarea에 코드 에디터 편의 동작 부여 (괄호 자동완성, 자동 들여쓰기, Tab)

const PAIRS = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
const CLOSERS = new Set(['}', ')', ']', '"', "'"]);
const UNIT = '    ';

export function attachCodeEditor(ta) {
    ta.setAttribute('spellcheck', 'false');
    ta.setAttribute('autocapitalize', 'off');
    ta.addEventListener('keydown', onKeyDown);
}

function setValue(ta, value, selStart, selEnd = selStart) {
    ta.value = value;
    ta.selectionStart = selStart;
    ta.selectionEnd = selEnd;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
}

function onKeyDown(e) {
    const ta = e.currentTarget;
    const s = ta.selectionStart;
    const en = ta.selectionEnd;
    const v = ta.value;
    const before = v.slice(0, s);
    const after = v.slice(en);
    const selected = v.slice(s, en);
    const lineStart = before.lastIndexOf('\n') + 1;
    const indent = (before.slice(lineStart).match(/^[ \t]*/) || [''])[0];

    // 여는 괄호/따옴표 → 쌍으로 삽입, 커서는 안쪽
    if (Object.prototype.hasOwnProperty.call(PAIRS, e.key)) {
        e.preventDefault();
        const close = PAIRS[e.key];
        if (selected) {
            setValue(ta, before + e.key + selected + close + after, s + 1, s + 1 + selected.length);
        } else {
            setValue(ta, before + e.key + close + after, s + 1);
        }
        return;
    }

    // 닫는 괄호를 이미 있는 닫는 괄호 위에서 누르면 → 그냥 건너뛰기
    if (CLOSERS.has(e.key) && after[0] === e.key) {
        e.preventDefault();
        setValue(ta, v, s + 1);
        return;
    }

    // Enter: 자동 들여쓰기, { } 사이면 블록 펼치기
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (before.endsWith('{') && after.startsWith('}')) {
            const mid = '\n' + indent + UNIT;
            setValue(ta, before + mid + '\n' + indent + after, s + mid.length);
        } else {
            const ins = '\n' + indent + (before.endsWith('{') ? UNIT : '');
            setValue(ta, before + ins + after, s + ins.length);
        }
        return;
    }

    // Tab / Shift+Tab
    if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
            if (v.slice(lineStart, lineStart + UNIT.length) === UNIT) {
                setValue(ta, v.slice(0, lineStart) + v.slice(lineStart + UNIT.length),
                    Math.max(lineStart, s - UNIT.length), Math.max(lineStart, en - UNIT.length));
            }
        } else {
            setValue(ta, before + UNIT + after, s + UNIT.length);
        }
        return;
    }

    // 빈 쌍 안에서 Backspace → 양쪽 다 삭제
    if (e.key === 'Backspace' && s === en && PAIRS[before.slice(-1)] === after[0]) {
        e.preventDefault();
        setValue(ta, before.slice(0, -1) + after.slice(1), s - 1);
    }
}
