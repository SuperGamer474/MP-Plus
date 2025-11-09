(function () {
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
    function toggleSpeedrunner() {
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
       Feature Implementations
       ------------------------- */
    function enableRightClickAndSelect() {
        if (window.__rightClickHandler) return;
        
        // Enable right click
        window.__rightClickHandler = e => e.stopPropagation();
        document.addEventListener('contextmenu', window.__rightClickHandler, true);
        
        // Enable text selection
        window.__textSelectHandler = e => {
            if (e.type === 'click' || e.type === 'mousedown') return;
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };
        
        // Remove selection-blocking styles
        document.querySelectorAll('*').forEach(element => {
            if (element.style.userSelect === 'none' || 
                element.style.webkitUserSelect === 'none' ||
                element.style.MozUserSelect === 'none' ||
                element.style.msUserSelect === 'none') {
                element.style.userSelect = 'auto';
                element.style.webkitUserSelect = 'auto';
                element.style.MozUserSelect = 'auto';
                element.style.msUserSelect = 'auto';
            }
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
    }

    function disableRightClickAndSelect() {
        if (!window.__rightClickHandler) return;
        
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
            window.__selectionStyle.remove();
            window.__selectionStyle = null;
        }
    }

    function enableremoveAnnoying() {
        if (window.__removeAnnoyingEnabled) return;
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
            window.__removeAnnoyingObserver = null;
        }

        // Backup interval
        window.__removeAnnoyingInterval = setInterval(() => {
            try { document.querySelectorAll('.question-blur').forEach(el => el.classList.remove('question-blur')); } catch(_) {}
            try { document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()); } catch(_) {}
            try { document.querySelectorAll('div.red-stuff').forEach(el => el.classList.remove('red-stuff')); } catch(_) {}
        }, 300);
    }

    function disableremoveAnnoying() {
        if (!window.__removeAnnoyingEnabled) return;
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
    }

    function startSpeedrunner() {
        if (window.__autoClickerRunning) return;
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
            }
        })();
    }

    function stopSpeedrunner() {
        window.__autoClickerStopRequested = true;
        window.__autoClickerRunning = false;
    }

    /* -------------------------
       Keyboard Shortcuts Setup
       ------------------------- */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Alt+1 - Speedrunner
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                toggleSpeedrunner();
            }
            // Alt+2 - Remove Annoying
            else if (e.altKey && e.key === '2') {
                e.preventDefault();
                toggleRemoveAnnoying();
            }
            // Alt+3 - Right Click
            else if (e.altKey && e.key === '3') {
                e.preventDefault();
                toggleRightClick();
            }
        });
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
        
        console.log('MP-Tools activated - Use Alt+1, Alt+2, Alt+3 to toggle features');
    }

    // Run initialization
    initialize();
})();
