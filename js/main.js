import { initRouter, registerRoute } from './router.js';
import { markVisit, getState } from './store.js';
import { perfectDays } from './core/streak.js';
import { render as renderLanding } from './pages/landing.js';
import { render as renderBattle } from './pages/battle.js';
import { render as renderTyping } from './pages/typing.js';
import { render as renderDiagnose } from './pages/diagnose.js';
import { render as renderQuest } from './pages/quest.js';
import { render as renderMe, currentTitle } from './pages/me.js';

registerRoute('', renderLanding);
registerRoute('battle', renderBattle);
registerRoute('typing', renderTyping);
registerRoute('diagnose', renderDiagnose);
registerRoute('quest', renderQuest);
registerRoute('me', renderMe);

markVisit();

const titleEl = document.querySelector('[data-role="header-title"]');
if (titleEl) titleEl.textContent = currentTitle(perfectDays(getState().questLog));

initRouter(document.getElementById('app'));
