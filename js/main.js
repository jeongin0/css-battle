import { initRouter, registerRoute } from './router.js';
import { render as renderLanding } from './pages/landing.js';
import { render as renderBattle } from './pages/battle.js';

registerRoute('', renderLanding);
registerRoute('battle', renderBattle);

initRouter(document.getElementById('app'));
