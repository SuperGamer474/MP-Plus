// script.js - Full un-minified MP Tools bookmarklet script
// Hosted at: https://raw.githubusercontent.com/SuperGamer474/MP-Tools/refs/heads/main/script.js

(function () {
    // === Entry Point: MP_Tools() ===
    // This function is called by the bookmarklet loader.
    // It creates or removes the MP Tools panel.
    window.MP_Tools = function () {
        const existingPanel = document.getElementById('mp-tools-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        createPanel();
    };

    // === Main Panel Creation ===
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'mp-tools-panel';
        panel.style.cssText = `
            position: fixed;
            right: 12px;
            top: 12px;
            width: 420px;
            z-index: 2147483647;
            background: #0f1724;
            color: #e6eef8;
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(2,6,23,.7);
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            box-sizing: border-box;
            user-select: none;
        `;

        // Header (title + close button + drag handle)
        const header = createHeader(panel);
        panel.appendChild(header);

        // Info text
        const info = document.createElement('div');
        info.textContent = 'Choose a tool:';
        info.style.marginBottom = '8px';
        panel.appendChild(info);

        // Two columns: Speedrunner | Right Click
        const columns = document.createElement('div');
        columns.style.cssText = 'display: flex; gap: 10px;';

        const col1 = createColumn();
        const col2 = createColumn();

        // Speedrunner Column
        const speedBtn = createButton('Start Speedrunner', '#16a34a', '#ffffff');
        const stopBtn = createButton('Stop Speedrunner', '#ef4444', '#ffffff');
        col1.appendChild(speedBtn);
        col1.appendChild(stopBtn);

        // Right Click Column
        const enableBtn = createButton('Enable Right Click', '#16a34a', '#ffffff');
        const disableBtn = createButton('Disable Right Click', '#ef4444', '#ffffff');
        col2.appendChild(enableBtn);
        col2.appendChild(disableBtn);

        columns.appendChild(col1);
        columns.appendChild(col2);
        panel.appendChild(columns);

        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top: 8px; font-size: 11px; opacity: .85;';
        footer.textContent = 'Drag the header to move. Use ✕ to close.';
        panel.appendChild(footer);

        document.body.appendChild(panel);

        // === Attach Functionality ===
        attachSpeedrunner(speedBtn, stopBtn);
        attachRightClick(enableBtn, disableBtn);
        makeDraggable(panel, header);
    }

    // === Helper: Create Header with Close Button ===
    function createHeader(panel) {
        const header = document.createElement('div');
        header.style.cssText = `
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: grab;
        `;
        header.textContent = 'MP Tools';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = 'Close';
        closeBtn.style.cssText = `
            background: transparent;
            border: 0;
            color: inherit;
            cursor: pointer;
            font-size: 14px;
        `;
        closeBtn.onclick = () => panel.remove();

        header.appendChild(closeBtn);
        return header;
    }

    // === Helper: Create Column ===
    function createColumn() {
        const col = document.createElement('div');
        col.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px;';
        return col;
    }

    // === Helper: Create Styled Button ===
    function createButton(text, bgColor, textColor) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 0;
            cursor: pointer;
            box-sizing: border-box;
            font-weight: 700;
            font-size: 12px;
            background: ${bgColor};
            color: ${textColor};
        `;
        return btn;
    }

    // === Speedrunner Logic ===
    function attachSpeedrunner(startBtn, stopBtn) {
        startBtn.onclick = function () {
            if (window.__autoClickerRunning) {
                console.log('Speedrunner already running');
                return;
            }

            window.__autoClickerStopRequested = false;
            window.__autoClickerRunning = true;

            (async function () {
                async function waitFor(selector, text, timeout = 10000) {
                    const start = Date.now();
                    return new Promise((resolve, reject) => {
                        const interval = setInterval(() => {
                            const elements = [...document.querySelectorAll(selector)];
                            for (const el of elements) {
                                if (el.textContent.trim() === text) {
                                    clearInterval(interval);
                                    resolve(el);
                                    return;
                                }
                            }
                            if (Date.now() - start > timeout) {
                                clearInterval(interval);
                                reject(new Error('Timeout: ' + text));
                            }
                        }, 200);
                    });
                }

                function sleep(ms) {
                    return new Promise(r => setTimeout(r, ms));
                }

                try {
                    while (!window.__autoClickerStopRequested) {
                        try {
                            (await waitFor('div.bottom-button.card-button.check-button.flex.items-center.relative.right-button.round-button', 'Check my answer')).click();
                            (await waitFor('div.next-button.ph3.pv2.card-button.round-button.bottom-button.left-button.flex.items-center.mr2', 'Complete question')).click();
                            await sleep(3000);
                        } catch (e) {
                            await sleep(1000);
                        }
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    window.__autoClickerRunning = false;
                    console.log('Speedrunner stopped');
                }
            })();
        };

        stopBtn.onclick = function () {
            window.__autoClickerStopRequested = true;
            window.__autoClickerRunning = false;
            console.log('Requested stop for speedrunner');
        };
    }

    // === Right Click Unblocker ===
    function attachRightClick(enableBtn, disableBtn) {
        enableBtn.onclick = function () {
            if (window.__allowRClickInterval) {
                console.log('Right-click unblocker already running');
                return;
            }

            window.__allowRClick_handler = function (e) {
                try { e.stopImmediatePropagation(); } catch (_) {}
            };

            window.__allowRClick_purge = function () {
                try {
                    document.oncontextmenu = null;
                    document.onmousedown = null;
                    document.onmouseup = null;

                    document.querySelectorAll('*').forEach(el => {
                        el.oncontextmenu = null;
                        el.onmousedown = null;
                        el.onmouseup = null;
                    });

                    ['contextmenu', 'mousedown', 'mouseup'].forEach(evt => {
                        window.addEventListener(evt, window.__allowRClick_handler, true);
                        document.addEventListener(evt, window.__allowRClick_handler, true);
                    });

                    window.__allowRClick_installed = true;
                } catch (err) {
                    console.error(err);
                }
            };

            window.__allowRClickInterval = setInterval(window.__allowRClick_purge, 50);
            console.log('Right-click unblocker running.');
        };

        disableBtn.onclick = function () {
            if (window.__allowRClickInterval) {
                clearInterval(window.__allowRClickInterval);
            }

            if (window.__allowRClick_installed && window.__allowRClick_handler) {
                ['contextmenu', 'mousedown', 'mouseup'].forEach(evt => {
                    try { window.removeEventListener(evt, window.__allowRClick_handler, true); } catch (_) {}
                    try { document.removeEventListener(evt, window.__allowRClick_handler, true); } catch (_) {}
                });
            }

            window.__allowRClick_installed = false;
            window.__allowRClick_handler = null;
            window.__allowRClick_purge = null;
            window.__allowRClickInterval = null;

            console.log('Right-click unblocker stopped');
        };
    }

    // === Draggable Panel ===
    function makeDraggable(panel, handle) {
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        function onMove(e) {
            const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
            const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
            if (!dragging || clientX == null) return;

            panel.style.left = (clientX - offsetX) + 'px';
            panel.style.top = (clientY - offsetY) + 'px';
            panel.style.right = '';
        }

        function onUp() {
            dragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
        }

        handle.addEventListener('mousedown', function (e) {
            dragging = true;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        handle.addEventListener('touchstart', function (e) {
            dragging = true;
            const t = e.touches[0];
            const rect = panel.getBoundingClientRect();
            offsetX = t.clientX - rect.left;
            offsetY = t.clientY - rect.top;
            document.addEventListener('touchmove', onMove);
            document.addEventListener('touchend', onUp);
        });
    }
})();
