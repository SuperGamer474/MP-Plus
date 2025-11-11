(function () {
    // Prevent multiple injections / double initialization
    if (window.__mpToolsInitialized) {
        console.log('MP-Tools: already initialized — skipping re-init');
        return;
    }
    window.__mpToolsInitialized = true;

    /* -------------------------
       Persistent global state
       ------------------------- */
    function loadState() {
        try {
            const raw = localStorage.getItem('__mpToolsState_v1');
            if (raw) {
                window.__mpToolsState = JSON.parse(raw);
            } else {
                window.__mpToolsState = {
                    speedrunner: false,
                    rightClick: false,
                    removeAnnoying: false
                };
            }
        } catch (e) {
            window.__mpToolsState = {
                speedrunner: false,
                rightClick: false,
                removeAnnoying: false
            };
        }
    }
    function saveState() {
        try {
            localStorage.setItem('__mpToolsState_v1', JSON.stringify(window.__mpToolsState || {}));
        } catch (e) { /* ignore */ }
    }

    // init global state
    if (!window.__mpToolsState) loadState();

    /* -------------------------
       Status Display Functions
       ------------------------- */
    function showStatus(message, color) {
        // Remove existing status if any
        const existingStatus = document.getElementById('mp-tools-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        const status = document.createElement('div');
        status.id = 'mp-tools-status';
        status.style.cssText = `
            position: fixed;
            top: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 6px 10px;
            border-radius: 4px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            font-weight: bold;
            z-index: 2147483647;
            pointer-events: none;
            border: 1px solid ${color};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        status.textContent = message;
        document.body.appendChild(status);

        // Auto remove after 2 seconds
        setTimeout(() => {
            if (status.parentNode) {
                status.remove();
            }
        }, 2000);
    }

    function showActivated() {
        showStatus('MP-Tools activated', '#3b82f6'); // blue
    }

    /* -------------------------
       Feature Toggle Functions
       ------------------------- */
    // shared debounce for toggles (prevents rapid double-toggle firing)
    window.__mpToolsLastToggle = window.__mpToolsLastToggle || 0;
    function shouldDebounceToggle(ms = 300) {
        const now = Date.now();
        if (now - window.__mpToolsLastToggle < ms) {
            return true;
        }
        window.__mpToolsLastToggle = now;
        return false;
    }

    function toggleSpeedrunner() {
        if (shouldDebounceToggle()) return console.log('toggleSpeedrunner: debounced');
        window.__mpToolsState.speedrunner = !window.__mpToolsState.speedrunner;
        saveState();
        
        if (window.__mpToolsState.speedrunner) {
            startSpeedrunner();
            showStatus('Speedrunner - ON', '#10b981'); // green
        } else {
            stopSpeedrunner();
            showStatus('Speedrunner - OFF', '#ef4444'); // red
        }
    }

    function toggleRemoveAnnoying() {
        if (shouldDebounceToggle()) return console.log('toggleRemoveAnnoying: debounced');
        window.__mpToolsState.removeAnnoying = !window.__mpToolsState.removeAnnoying;
        saveState();
        
        if (window.__mpToolsState.removeAnnoying) {
            enableremoveAnnoying();
            showStatus('Remove Annoying - ON', '#10b981'); // green
        } else {
            disableremoveAnnoying();
            showStatus('Remove Annoying - OFF', '#ef4444'); // red
        }
    }

    function toggleRightClick() {
        if (shouldDebounceToggle()) return console.log('toggleRightClick: debounced');
        window.__mpToolsState.rightClick = !window.__mpToolsState.rightClick;
        saveState();
        
        if (window.__mpToolsState.rightClick) {
            enableRightClickAndSelect();
            showStatus('Right Click - ON', '#10b981'); // green
        } else {
            disableRightClickAndSelect();
            showStatus('Right Click - OFF', '#ef4444'); // red
        }
    }

    /* -------------------------
       ORIGINAL Feature Implementations (Restored)
       ------------------------- */
    function enableRightClickAndSelect() {
        if (window.__rightClickHandler) return console.log('Right click and text selection already enabled');
        
        // Enable right click
        window.__rightClickHandler = e => e.stopPropagation();
        document.addEventListener('contextmenu', window.__rightClickHandler, true);
        
        // Enable text selection by removing common blocking styles and events
        window.__textSelectHandler = e => {
            if (e.type === 'click' || e.type === 'mousedown') return;
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };
        
        // Remove common selection-blocking styles (inline)
        document.querySelectorAll('*').forEach(element => {
            try {
                if (element.style) {
                    if (element.style.userSelect === 'none' || 
                        element.style.webkitUserSelect === 'none' ||
                        element.style.MozUserSelect === 'none' ||
                        element.style.msUserSelect === 'none') {
                        element.style.userSelect = 'auto';
                        element.style.webkitUserSelect = 'auto';
                        element.style.MozUserSelect = 'auto';
                        element.style.msUserSelect = 'auto';
                    }
                }
            } catch (_) {}
        });
        
        // Add event listeners to prevent selection blocking
        const events = ['selectstart', 'dragstart'];
        events.forEach(eventType => {
            document.addEventListener(eventType, window.__textSelectHandler, true);
        });
        
        // Add CSS to override any styles that block selection
        if (!window.__selectionStyle) {
            window.__selectionStyle = document.createElement('style');
            window.__selectionStyle.textContent = `
                * {
                    user-select: auto !important;
                    -webkit-user-select: auto !important;
                    -moz-user-select: auto !important;
                    -ms-user-select: auto !important;
                }
            `;
            document.head.appendChild(window.__selectionStyle);
        }
        
        console.log('Right-click and text selection enabled');
    }

    function disableRightClickAndSelect() {
        if (!window.__rightClickHandler) return console.log('Right click and text selection already disabled');
        
        // Remove right click handler
        document.removeEventListener('contextmenu', window.__rightClickHandler, true);
        window.__rightClickHandler = null;
        
        // Remove text selection handlers
        if (window.__textSelectHandler) {
            const events = ['selectstart', 'dragstart'];
            events.forEach(eventType => {
                document.removeEventListener(eventType, window.__textSelectHandler, true);
            });
            window.__textSelectHandler = null;
        }
        
        // Remove the CSS override
        if (window.__selectionStyle) {
            try { window.__selectionStyle.remove(); } catch (_) {}
            window.__selectionStyle = null;
        }
        
        console.log('Right-click and text selection disabled');
    }

    function enableremoveAnnoying() {
        if (window.__removeAnnoyingEnabled) return console.log('Remove Annoying already enabled');
        window.__removeAnnoyingEnabled = true;

        // Initial sweep
        try {
            document.querySelectorAll('.question-blur').forEach(el => el.classList.remove('question-blur'));
        } catch (e) {}
        try {
            document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove());
        } catch (e) {}
        try {
            document.querySelectorAll('div.red-stuff').forEach(el => el.classList.remove('red-stuff'));
        } catch (e) {}

        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                // attribute changes: strip classes immediately
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    try {
                        const t = m.target;
                        if (t && t.classList) {
                            if (t.classList.contains('question-blur')) t.classList.remove('question-blur');
                            if (t.tagName === 'DIV' && t.classList.contains('red-stuff')) t.classList.remove('red-stuff');
                        }
                    } catch (_) {}
                }

                // childList: handle added nodes
                if (m.type === 'childList') {
                    m.addedNodes.forEach(node => {
                        if (!node || node.nodeType !== 1) return;
                        try {
                            if (node.matches && node.matches('.cdk-overlay-container')) {
                                node.remove();
                                return;
                            }
                        } catch (_) {}
                        try {
                            if (node.classList && node.classList.contains('question-blur')) node.classList.remove('question-blur');
                            node.querySelectorAll && node.querySelectorAll('.question-blur').forEach(el => el.classList.remove('question-blur'));
                        } catch (_) {}
                        try {
                            if (node.tagName === 'DIV' && node.classList && node.classList.contains('red-stuff')) node.classList.remove('red-stuff');
                            node.querySelectorAll && node.querySelectorAll('div.red-stuff').forEach(el => el.classList.remove('red-stuff'));
                        } catch (_) {}
                        try {
                            node.querySelectorAll && node.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove());
                        } catch (_) {}
                    });
                }
            }
        });

        try {
            observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
            window.__removeAnnoyingObserver = observer;
        } catch (e) {
            console.error('Remove Annoying observer failed to start', e);
            window.__removeAnnoyingObserver = null;
        }

        // Backup interval in case something bypasses the observer
        window.__removeAnnoyingInterval = setInterval(() => {
            try { document.querySelectorAll('.question-blur').forEach(el => el.classList.remove('question-blur')); } catch(_) {}
            try { document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()); } catch(_) {}
            try { document.querySelectorAll('div.red-stuff').forEach(el => el.classList.remove('red-stuff')); } catch(_) {}
        }, 300);

        console.log('Remove Annoying ON — stripping question-blur, removing overlays, and removing red-stuff class from divs');
    }

    function disableremoveAnnoying() {
        if (!window.__removeAnnoyingEnabled) return console.log('Remove Annoying already disabled');
        window.__removeAnnoyingEnabled = false;
        try {
            if (window.__removeAnnoyingObserver) {
                window.__removeAnnoyingObserver.disconnect();
                window.__removeAnnoyingObserver = null;
            }
        } catch (_) {}
        try {
            if (window.__removeAnnoyingInterval) {
                clearInterval(window.__removeAnnoyingInterval);
                window.__removeAnnoyingInterval = null;
            }
        } catch (_) {}
        console.log('Remove Annoying OFF');
    }

    function startSpeedrunner() {
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

        (async function run() {
            try {
                while (!window.__autoClickerStopRequested) {
                    try {
                        (await wait('div.bottom-button.card-button.check-button.flex.items-center.relative.right-button.round-button',
                                    'Check my answer')).click();
                        (await wait('div.next-button.ph3.pv2.card-button.round-button.bottom-button.left-button.flex.items-center.mr2',
                                    'Complete question')).click();
                        await sleep(3000);
                    } catch (e) { await sleep(1000); }
                }
            } finally {
                window.__autoClickerRunning = false;
                console.log('Speedrunner stopped');
            }
        })();
    }

    function stopSpeedrunner() {
        window.__autoClickerStopRequested = true;
        window.__autoClickerRunning = false;
        console.log('Stop requested');
    }

    /* -------------------------
       Calculator feature (from original) — only this feature added
       - No close button in header
       - Toggle via Alt+4 (keyboard) or programmatically via toggleCalculator()
       ------------------------- */

    function ensureDesmos() {
        if (window.Desmos) return Promise.resolve();
        if (window.__mp_desmos_loading_promise) return window.__mp_desmos_loading_promise;
        window.__mp_desmos_loading_promise = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=78043328c170484d8c2b47e1013a0d12';
            s.async = true;
            s.onload = () => resolve();
            s.onerror = (e) => reject(new Error('Failed to load Desmos script'));
            document.head.appendChild(s);
        });
        return window.__mp_desmos_loading_promise;
    }

    function initDesmos() {
        try {
            const el = document.getElementById('mp-desmos-body-calc');
            if (!el) return;
            if (window.__mp_desmos_instance) {
                try { if (typeof window.__mp_desmos_instance.update === 'function') window.__mp_desmos_instance.update(); } catch(_) {}
                return;
            }
            window.__mp_desmos_instance = Desmos && Desmos.ScientificCalculator
                ? Desmos.ScientificCalculator(el, { keypad: true })
                : null;
            if (!window.__mp_desmos_instance) console.error('Desmos object not available or API changed');
        } catch (err) {
            console.error('Error initialising Desmos', err);
        }
    }

    function openCalculator() {
        const existingPanel = document.getElementById('mp-desmos-panel');
        if (existingPanel) {
            // already open — bring forward
            existingPanel.style.display = '';
            existingPanel.style.zIndex = 2147483648;
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'mp-desmos-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:320px;height:440px; /* slightly taller */
            z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;overflow:hidden;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        // NO close button here (per request)
        header.innerHTML = `<span style="pointer-events:none;">Calculator</span>`;
        panel.appendChild(header);

        const body = document.createElement('div');
        body.id = 'mp-desmos-body';
        body.style.cssText = `
            width:100%;height:calc(100% - 36px); /* header is 36px high */
            margin:0;padding:0;box-sizing:border-box;background:transparent;
        `;

        const desmosContainer = document.createElement('div');
        desmosContainer.id = 'mp-desmos-body-calc';
        desmosContainer.style.cssText = `
            width:100%;height:100%;border-radius:6px;overflow:hidden;
        `;
        body.appendChild(desmosContainer);
        panel.appendChild(body);
        document.body.appendChild(panel);

        // simple drag implementation (keeps file self-contained)
        (function simpleDrag() {
            let dragging = false, ox = 0, oy = 0;
            const move = e => {
                const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
                const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
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
                header.style.cursor = 'grab';
            };
            header.addEventListener('mousedown', e => {
                dragging = true;
                const r = panel.getBoundingClientRect();
                ox = e.clientX - r.left;
                oy = e.clientY - r.top;
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
                header.style.cursor = 'grabbing';
                e.preventDefault();
            });
            header.addEventListener('touchstart', e => {
                dragging = true;
                const t = e.touches[0];
                const r = panel.getBoundingClientRect();
                ox = t.clientX - r.left;
                oy = t.clientY - r.top;
                document.addEventListener('touchmove', move);
                document.addEventListener('touchend', up);
                header.style.cursor = 'grabbing';
                e.preventDefault();
            });
        })();

        // ensure Desmos loads and initializes
        ensureDesmos().then(initDesmos).catch(err => {
            console.error('Failed to load Desmos calculator:', err);
            const errNotice = document.createElement('div');
            errNotice.style.cssText = 'padding:10px;color:#900;font-weight:700;';
            errNotice.textContent = 'Desmos failed to load.';
            const bodyEl = document.getElementById('mp-desmos-body');
            bodyEl && bodyEl.appendChild(errNotice);
        });

        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = 2147483648;
        });
    }

    function destroyCalculatorPanel() {
        try {
            const panel = document.getElementById('mp-desmos-panel');
            if (panel) panel.remove();
        } catch (_) {}
        try {
            if (window.__mp_desmos_instance && typeof window.__mp_desmos_instance.destroy === 'function') {
                window.__mp_desmos_instance.destroy();
            }
        } catch (_) {}
        window.__mp_desmos_instance = null;
        console.log('Calculator panel removed');
    }

    function toggleCalculator() {
        if (shouldDebounceToggle()) return console.log('toggleCalculator: debounced');
        const existing = document.getElementById('mp-desmos-panel');
        if (existing) {
            destroyCalculatorPanel();
            showStatus('Calculator - OFF', '#ef4444');
        } else {
            openCalculator();
            showStatus('Calculator - ON', '#10b981');
        }
    }

    /* -------------------------
       Keyboard Shortcuts Setup (improved)
       ------------------------- */
    function setupKeyboardShortcuts() {
        if (window.__mpToolsKeyboardSetup) {
            console.log('Keyboard shortcuts already set up');
            return;
        }
        window.__mpToolsKeyboardSetup = true;

        // Debounce guard shared for whole keyboard handling
        window.__mpToolsLastKeyAt = window.__mpToolsLastKeyAt || 0;

        document.addEventListener('keydown', function(e) {
            // Basic guard to avoid handling repeated keydown events too quickly
            const now = Date.now();
            if (now - window.__mpToolsLastKeyAt < 150) return;
            // Use physical key code (avoids locale surprises). Fallback to e.key if needed.
            const isDigit1 = e.code === 'Digit1' || e.key === '1';
            const isDigit2 = e.code === 'Digit2' || e.key === '2';
            const isDigit3 = e.code === 'Digit3' || e.key === '3';
            const isDigit4 = e.code === 'Digit4' || e.key === '4';

            if (e.altKey && isDigit1) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+1 pressed => toggling speedrunner');
                toggleSpeedrunner();
            } else if (e.altKey && isDigit2) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+2 pressed => toggling removeAnnoying');
                toggleRemoveAnnoying();
            } else if (e.altKey && isDigit3) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+3 pressed => toggling rightClick');
                toggleRightClick();
            } else if (e.altKey && isDigit4) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+4 pressed => toggling calculator');
                toggleCalculator();
            }
        }, true);
    }

    /* -------------------------
       Initialize on load
       ------------------------- */
    function initialize() {
        // Show activation message
        showActivated();
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Apply saved states
        if (window.__mpToolsState.speedrunner) {
            startSpeedrunner();
        }
        if (window.__mpToolsState.rightClick) {
            enableRightClickAndSelect();
        }
        if (window.__mpToolsState.removeAnnoying) {
            enableremoveAnnoying();
        }
        
        console.log('MP-Tools activated - Use Alt+1, Alt+2, Alt+3 to toggle features; Alt+4 toggles Calculator');
    }

    // Run initialization
    initialize();
})();
