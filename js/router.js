const routes = {};
let container = null;
let cleanupCurrent = null;

export function registerRoute(path, render) {
    routes[path] = render;
}

function currentPath() {
    return location.hash.slice(1);
}

function updateActiveNav(path) {
    document.querySelectorAll('.site-header-nav a').forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${path}`);
    });
}

async function handleRouteChange() {
    const path = currentPath();
    const render = routes[path] || routes[''];

    if (typeof cleanupCurrent === 'function') {
        cleanupCurrent();
        cleanupCurrent = null;
    }

    container.innerHTML = '';
    cleanupCurrent = render(container) || null;
    updateActiveNav(path);
}

export function initRouter(appContainer) {
    container = appContainer;
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
}
