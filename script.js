(function () {
    window.MP_Tools = function () {
        if (document.getElementById('mp-tools-panel')) {
            document.getElementById('mp-tools-panel').remove();
            return;
        }
        createPanel();
    };

    function createPanel() {
        const host = document.createElement('div');
        host.id = 'mp-tools-panel';
        host.style.cssText = 'position:fixed;right:12px;top:12px;width:420px;z-index:2147483647;box-sizing:border-box;user-select:none;';
        document.body.appendChild(host);

        const s = host.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            all: initial;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            color: #e6eef8;
            width: 100%;
        `;
        wrapper.innerHTML = `
            <style>
                :host, .panel { display: block; }
                .panel {
                    position: relative;
                    right: 0;
                    top: 0;
                    width: 420px;
                    background: #0f1724;
                    color: #e6eef8;
                    padding: 12px;
                    border-radius: 10px;
                    box-shadow: 0 8px 32px rgba(2,6,23,.7);
                    font-size: 13px;
                    box-sizing: border-box;
                    user-select: none;
                }
                .header {
                    font-weight: 700;
                    margin-bottom: 8px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    cursor: grab;
                }
                .close-btn {
                    background: transparent;
                    border: 0;
                    color: inherit;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 4px 8px;
                }
                .label { margin-bottom: 8px; color: #cfe3ff; font-size:12px; }
                .cols { display:flex; gap:10px; }
                .col { flex:1; display:flex; flex-direction:column; gap:8px; }
                .btn {
                    width:100%;
                    padding:10px;
                    border-radius:8px;
                    border:0;
                    cursor:pointer;
                    box-sizing:border-box;
                    font-weight:700;
                    font-size:12px;
                }
            </style>
            <div class="panel" id="panel">
                <div class="header" id="header">
                    <div id="title">MP Tools</div>
                    <button class="close-btn" id="close">X</button>
                </div>
                <div class="label">Choose a tool:</div>
                <div class="cols">
                    <div class="col" id="c1"></div>
                    <div class="col" id="c2"></div>
                </div>
            </div>
        `;

        s.appendChild(wrapper);

        const panelEl = s.getElementById('panel');
        const headerEl = s.getElementById('header');
        const closeEl = s.getElementById('close');
        const c1 = s.getElementById('c1');
        const c2 = s.getElementById('c2');

        function makeBtn(text, bg, fg) {
            const b = document.createElement('button');
            b.className = 'btn';
            b.textContent = text;
            b.style.cssText = `background:${bg};color:${fg};`;
            return b;
        }

        const startBtn = makeBtn('Start Speedrunner', '#16a34a', '#fff');
        const stopBtn = makeBtn('Stop Speedrunner', '#ef4444', '#fff');
        stopBtn.style.marginBottom = '12px';
        const enableBtn = makeBtn('Enable Right Click', '#16a34a', '#fff');
        const disableBtn = makeBtn('Disable Right Click', '#ef4444', '#fff');
        const calcBtn = makeBtn('Open Calculator', '#0ea5a4', '#fff');

        c1.appendChild(startBtn);
        c1.appendChild(stopBtn);
        c1.appendChild(calcBtn);
        c2.appendChild(enableBtn);
        c2.appendChild(disableBtn);

        closeEl.onclick = () => host.remove();

        speedrunner(startBtn, stopBtn);
        rightClick(enableBtn, disableBtn);
        draggable(host, headerEl);

        calcBtn.onclick = () => openCalculator();
    }

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
                window.__allowRClick_handler = handler;
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

    function openCalculator() {
        const existing = document.getElementById('mp-desmos-panel');
        if (existing) {
            existing.style.display = existing.style.display === 'none' ? '' : existing.style.display;
            existing.style.zIndex = 2147483648;
            return;
        }

        const host = document.createElement('div');
        host.id = 'mp-desmos-panel';
        host.style.cssText = 'position:fixed;left:12px;top:12px;width:420px;height:500px;z-index:2147483648;box-sizing:border-box;user-select:none;';
        document.body.appendChild(host);

        const s = host.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            all: initial;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            width: 100%;
            height: 100%;
        `;
        wrapper.innerHTML = `
            <style>
                .panel {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    color: #111;
                    border-radius: 8px;
                    border: 1px solid #bbb;
                    box-shadow: 0 8px 30px rgba(0,0,0,.4);
                    overflow: hidden;
                    display:flex;
                    flex-direction:column;
                }
                .header {
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    background:#2b2f33;
                    color:#fff;
                    padding:8px 10px;
                    cursor:grab;
                    font-weight:700;
                    font-size:13px;
                }
                .header .title { pointer-events:none; }
                .header .close {
                    background:transparent;border:0;color:inherit;cursor:pointer;padding:2px 6px;font-size:14px;
                }
                .body {
                    width:100%;
                    height:calc(100% - 42px);
                    padding:8px;
                    box-sizing:border-box;
                    background:transparent;
                    display:flex;
                }
                .desmos {
                    width:100%;
                    height:100%;
                    border-radius:6px;
                    overflow:hidden;
                    background: #fff;
                }
            </style>
            <div class="panel" id="panel">
                <div class="header" id="header">
                    <span class="title">Calculator</span>
                    <button class="close" id="close">✕</button>
                </div>
                <div class="body" id="body">
                    <div class="desmos" id="scientificCalc"></div>
                </div>
            </div>
        `;

        s.appendChild(wrapper);

        const panelEl = s.getElementById('panel');
        const headerEl = s.getElementById('header');
        const closeEl = s.getElementById('close');
        const desmosContainer = s.getElementById('scientificCalc');

        closeEl.onclick = () => {
            try {
                if (window.__mp_desmos_instance && typeof window.__mp_desmos_instance.destroy === 'function') {
                    window.__mp_desmos_instance.destroy();
                }
            } catch (err) {}
            window.__mp_desmos_instance = null;
            host.remove();
        };

        draggable(host, headerEl);

        function ensureDesmos() {
            if (window.Desmos) return Promise.resolve();
            if (window.__mp_desmos_loading_promise) return window.__mp_desmos_loading_promise;
            window.__mp_desmos_loading_promise = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=78043328c170484d8c2b47e1013a0d12';
                s.async = true;
                s.onload = () => resolve();
                s.onerror = () => reject(new Error('Failed to load Desmos script'));
                document.head.appendChild(s);
            });
            return window.__mp_desmos_loading_promise;
        }

        function initDesmos() {
            try {
                if (!desmosContainer) return;
                if (window.__mp_desmos_instance) {
                    try { if (typeof window.__mp_desmos_instance.update === 'function') window.__mp_desmos_instance.update(); } catch(_) {}
                    return;
                }
                window.__mp_desmos_instance = Desmos && Desmos.ScientificCalculator
                    ? Desmos.ScientificCalculator(desmosContainer, { keypad: true })
                    : null;
                if (!window.__mp_desmos_instance) console.error('Desmos object not available or API changed');
            } catch (err) {
                console.error('Error initialising Desmos', err);
            }
        }

        ensureDesmos().then(initDesmos).catch(err => {
            console.error('Failed to load Desmos calculator:', err);
            const errNotice = document.createElement('div');
            errNotice.style.cssText = 'padding:10px;color:#900;font-weight:700;';
            errNotice.textContent = 'Desmos failed to load.';
            s.getElementById('body').appendChild(errNotice);
        });

        host.addEventListener('mousedown', () => {
            host.style.zIndex = 2147483648;
        });
    }

    function draggable(hostElement, handleInShadow) {
        let dragging = false, ox = 0, oy = 0;
        const move = e => {
            const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
            const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
            if (!dragging || x == null) return;
            const left = x - ox;
            const top = y - oy;
            hostElement.style.left = left + 'px';
            hostElement.style.top = top + 'px';
            hostElement.style.right = '';
            hostElement.style.bottom = '';
        };
        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
            try { handleInShadow.style.cursor = 'grab'; } catch (_) {}
        };
        const startDrag = e => {
            dragging = true;
            const r = hostElement.getBoundingClientRect();
            const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
            const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
            ox = clientX - r.left;
            oy = clientY - r.top;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', up);
            try { handleInShadow.style.cursor = 'grabbing'; } catch (_) {}
            e.preventDefault();
        };
        try {
            handleInShadow.addEventListener('mousedown', startDrag);
            handleInShadow.addEventListener('touchstart', startDrag, { passive: false });
        } catch (err) {}
    }
})();
