// == MP Tools – full, readable, self-contained script ==
// 1. Floating draggable panel
// 2. Speedrunner auto-clicker
// 3. Right-click unblocker
// -----------------------------------------------------

(function () {
    // -------------------------------------------------
    // PUBLIC ENTRY POINT – the bookmarklet calls this
    // -------------------------------------------------
    window.MP_Tools = function () {
        // Remove panel if it already exists (re-run = close)
        if (document.getElementById('mp-tools-panel')) {
            document.getElementById('mp-tools-panel').remove();
            return;
        }
        createPanel();
    };

    // -------------------------------------------------
    // Build UI
    // -------------------------------------------------
    function createPanel() {
        const p = document.createElement('div');
        p.id = 'mp-tools-panel';
        p.style.cssText = `
            position:fixed;right:12px;top:12px;width:420px;z-index:2147483647;
            background:#0f1724;color:#e6eef8;padding:12px;border-radius:10px;
            box-shadow:0 8px 32px rgba(2,6,23,.7);font-family:Arial,Helvetica,sans-serif;
            font-size:13px;box-sizing:border-box;user-select:none;
        `;

        // Header + close + drag handle
        const h = document.createElement('div');
        h.style.cssText = `
            font-weight:700;margin-bottom:8px;display:flex;
            justify-content:space-between;align-items:center;cursor:grab;
        `;
        h.textContent = 'MP Tools';

        const x = document.createElement('button');
        x.textContent = 'X';
        x.title = 'Close';
        x.style.cssText = `
            background:transparent;border:0;color:inherit;
            cursor:pointer;font-size:14px;
        `;
        x.onclick = () => p.remove();
        h.appendChild(x);
        p.appendChild(h);

        // Info
        const i = document.createElement('div');
        i.textContent = 'Choose a tool:';
        i.style.marginBottom = '8px';
        p.appendChild(i);

        // Columns
        const cols = document.createElement('div');
        cols.style.cssText = 'display:flex;gap:10px;';

        const c1 = column();
        const c2 = column();

        // Speedrunner
        const startBtn = btn('Start Speedrunner', '#16a34a', '#fff');
        const stopBtn  = btn('Stop Speedrunner',  '#ef4444', '#fff');
        c1.appendChild(startBtn);
        c1.appendChild(stopBtn);

        // Right-click
        const enableBtn = btn('Enable Right Click', '#16a34a', '#fff');
        const disableBtn = btn('Disable Right Click', '#ef4444', '#fff');
        c2.appendChild(enableBtn);
        c2.appendChild(disableBtn);

        cols.appendChild(c1);
        cols.appendChild(c2);
        p.appendChild(cols);

        // Footer
        const f = document.createElement('div');
        f.style.cssText = 'margin-top:8px;font-size:11px;opacity:.85;';
        f.textContent = 'Drag header to move. X to close.';
        p.appendChild(f);

        document.body.appendChild(p);

        // Wire logic
        speedrunner(startBtn, stopBtn);
        rightClick(enableBtn, disableBtn);
        draggable(p, h);
    }

    // -------------------------------------------------
    // Helpers
    // -------------------------------------------------
    function column() {
        const d = document.createElement('div');
        d.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;';
        return d;
    }

    function btn(text, bg, fg) {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = `
            width:100%;padding:10px;border-radius:8px;border:0;
            cursor:pointer;box-sizing:border-box;font-weight:700;
            font-size:12px;background:${bg};color:${fg};
        `;
        return b;
    }

    // -------------------------------------------------
    // Speedrunner
    // -------------------------------------------------
    function speedrunner(start, stop) {
        start.onclick = async function () {
            if (window.__autoClickerRunning) return console.log('Speedrunner already running');
            window.__autoClickerStopRequested = false;
            window.__autoClickerRunning = true;

            const wait = (sel, txt, to = 10000) => new Promise((res, rej) => {
                const s = Date.now();
                const iv = setInterval(() => {
                    const els = [...document.querySelectorAll(sel)];
                    for (const el of els) if (el.textContent.trim() === txt) { clearInterval(iv); res(el); return; }
                    if (Date.now() - s > to) { clearInterval(iv); rej(new Error('Timeout: ' + txt)); }
                }, 200);
            });

            const sleep = ms => new Promise(r => setTimeout(r, ms));

            try {
                while (!window.__autoClickerStopRequested) {
                    try {
                        (await wait('div.bottom-button.card-button.check-button.flex.items-center.relative.right-button.round-button',
                                    'Check my answer')).click();
                        (await wait('div.next-button.ph3.pv2.card-button.round-button.bottom-button.left-button.flex.items-center.mr2',
                                    'Complete question')).click();
                        await sleep(3000);
                    } catch { await sleep(1000); }
                }
            } finally {
                window.__autoClickerRunning = false;
                console.log('Speedrunner stopped');
            }
        };

        stop.onclick = () => {
            window.__autoClickerStopRequested = true;
            window.__autoClickerRunning = false;
            console.log('Stop requested');
        };
    }

    // -------------------------------------------------
    // Right-click unblocker
    // -------------------------------------------------
    function rightClick(enable, disable) {
        enable.onclick = function () {
            if (window.__allowRClickInterval) return console.log('Already running');
            const handler = e => { try { e.stopImmediatePropagation(); } catch (_) {} };
            const purge = () => {
                document.oncontextmenu = document.onmousedown = document.onmouseup = null;
                document.querySelectorAll('*').forEach(el => {
                    el.oncontextmenu = el.onmousedown = el.onmouseup = null;
                });
                ['contextmenu','mousedown','mouseup'].forEach(ev => {
                    window.addEventListener(ev, handler, true);
                    document.addEventListener(ev, handler, true);
                });
                window.__allowRClick_installed = true;
            };
            window.__allowRClickInterval = setInterval(purge, 50);
            console.log('Right-click unblocker ON');
        };

        disable.onclick = function () {
            if (window.__allowRClickInterval) clearInterval(window.__allowRClickInterval);
            if (window.__allowRClick_installed && window.__allowRClick_handler) {
                ['contextmenu','mousedown','mouseup'].forEach(ev => {
                    try { window.removeEventListener(ev, window.__allowRClick_handler, true); } catch (_) {}
                    try { document.removeEventListener(ev, window.__allowRClick_handler, true); } catch (_) {}
                });
            }
            window.__allowRClick_installed = false;
            window.__allowRClick_handler = null;
            window.__allowRClickInterval = null;
            console.log('Right-click unblocker OFF');
        };
    }

    // -------------------------------------------------
    // Draggable
    // -------------------------------------------------
    function draggable(panel, handle) {
        let dragging = false, ox = 0, oy = 0;
        const move = e => {
            const x = e.clientX ?? e.touches?.[0]?.clientX;
            const y = e.clientY ?? e.touches?.[0]?.clientY;
            if (!dragging || x == null) return;
            panel.style.left = (x - ox) + 'px';
            panel.style.top  = (y - oy) + 'px';
            panel.style.right = '';
        };
        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
        };
        handle.addEventListener('mousedown', e => {
            dragging = true;
            const r = panel.getBoundingClientRect();
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });
        handle.addEventListener('touchstart', e => {
            dragging = true;
            const t = e.touches = e.touches[0];
            const r = panel.getBoundingClientRect();
            ox = t.clientX - r.left;
            oy = t.clientY - r.top;
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', up);
        });
    }
})();
