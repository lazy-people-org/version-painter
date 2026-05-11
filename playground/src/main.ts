const el = document.getElementById('out');
const win = window as Window & { version?: string; __BUILD_INFO__?: unknown };
if (el) {
    el.textContent = [`window.version = ${JSON.stringify(win.version)}`, `window.__BUILD_INFO__ = ${JSON.stringify(win.__BUILD_INFO__)}`].join('\n');
}
