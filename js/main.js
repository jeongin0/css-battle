import { initRouter, registerRoute } from './router.js';
import { render as renderLanding } from './pages/landing.js';
import { render as renderBattle } from './pages/battle.js';
import { render as renderTyping } from './pages/typing.js';
import { render as renderDiagnose } from './pages/diagnose.js';
import { render as renderQuest } from './pages/quest.js';
// 리포트 페이지 보류 (2026-08-28) — 되살리려면 이 import 와 아래 registerRoute, index.html 의 report 주석 해제
// import { render as renderReport } from './pages/report.js';

registerRoute('', renderLanding);
registerRoute('battle', renderBattle);
registerRoute('typing', renderTyping);
registerRoute('diagnose', renderDiagnose);
registerRoute('quest', renderQuest);
// registerRoute('report', renderReport);

initRouter(document.getElementById('app'));
