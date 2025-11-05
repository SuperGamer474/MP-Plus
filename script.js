(function () {
    window.MP_Tools = function () {
        if (document.getElementById('mp-tools-panel')) {
            document.getElementById('mp-tools-panel').remove();
            return;
        }
        createPanel();
    };
    function createPanel() {
        const p = document.createElement('div');
        p.id = 'mp-tools-panel';
        p.style.cssText = `
            position:fixed;right:12px;top:12px;width:420px;z-index:2147483647;
            background:#0f1724;color:#e6eef8;padding:12px;border-radius:10px;
            box-shadow:0 8px 32px rgba(2,6,23,.7);font-family:Arial,Helvetica,sans-serif;
            font-size:13px;box-sizing:border-box;user-select:none;
        `;
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
            cursor:pointer;font-size:14px;padding:4px 8px;
        `;
        x.onclick = () => p.remove();
        h.appendChild(x);
        p.appendChild(h);
        const i = document.createElement('div');
        i.textContent = 'Choose a tool:';
        i.style.marginBottom = '8px';
        p.appendChild(i);
        const cols = document.createElement('div');
        cols.style.cssText = 'display:flex;gap:10px;';
        const c1 = column();
        const c2 = column();
        const startBtn = btn('Start Speedrunner', '#16a34a', '#fff');
        const stopBtn = btn('Stop Speedrunner', '#ef4444', '#fff');
        stopBtn.style.marginBottom = '12px';
        c1.appendChild(startBtn);
        c1.appendChild(stopBtn);
        const enableBtn = btn('Enable Right Click', '#16a34a', '#fff');
        const disableBtn = btn('Disable Right Click', '#ef4444', '#fff');
        c2.appendChild(enableBtn);
        c2.appendChild(disableBtn);
        const calcBtn = btn('Open Calculator', '#0ea5a4', '#fff');
        c1.appendChild(calcBtn);
        // NEW: Open AI button (same color/style as calculator)
        const openAiBtn = btn('Open AI', '#0ea5a4', '#fff');
        c1.appendChild(openAiBtn);
        cols.appendChild(c1);
        cols.appendChild(c2);
        p.appendChild(cols);
        document.body.appendChild(p);
        speedrunner(startBtn, stopBtn);
        rightClick(enableBtn, disableBtn);
        draggable(p, h);
        calcBtn.onclick = () => openCalculator();
        openAiBtn.onclick = () => openOpenAI(); // hook up new button
    }
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
        const existingPanel = document.getElementById('mp-desmos-panel');
        if (existingPanel) {
            existingPanel.style.display = existingPanel.style.display === 'none' ? '' : existingPanel.style.display;
            existingPanel.style.zIndex = 2147483648;
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'mp-desmos-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:420px;height:500px;z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;padding:0;overflow:hidden;
        `;
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        header.innerHTML = `<span style="pointer-events:none;">Calculator</span>`;
        const headerBtns = document.createElement('div');
        headerBtns.style.cssText = 'display:flex;gap:6px;align-items:center;';
        const closeBtn = document.createElement('button');
        closeBtn.title = 'Close';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background:transparent;border:0;color:inherit;cursor:pointer;padding:2px 6px;
            font-size:14px;
        `;
        headerBtns.appendChild(closeBtn);
        header.appendChild(headerBtns);
        panel.appendChild(header);
        const body = document.createElement('div');
        body.id = 'mp-desmos-body';
        body.style.cssText = `
            width:100%;height:calc(100% - 42px);padding:8px;box-sizing:border-box;
            background:transparent;
        `;
        const desmosContainer = document.createElement('div');
        desmosContainer.id = 'scientificCalc';
        desmosContainer.style.cssText = 'width:100%;height:100%;border-radius:6px;overflow:hidden;';
        body.appendChild(desmosContainer);
        panel.appendChild(body);
        document.body.appendChild(panel);
        if (typeof draggable === 'function') {
            draggable(panel, header);
        } else {
            (function simpleDrag() {
                let dragging = false, ox = 0, oy = 0;
                const move = e => {
                    const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
                    const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
                    if (!dragging || x == null) return;
                    panel.style.left = (x - ox) + 'px';
                    panel.style.top = (y - oy) + 'px';
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
        }
        closeBtn.onclick = () => {
            try {
                if (window.__mp_desmos_instance && typeof window.__mp_desmos_instance.destroy === 'function') {
                    window.__mp_desmos_instance.destroy();
                }
            } catch (err) {}
            window.__mp_desmos_instance = null;
            panel.remove();
        };
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
                if (!document.getElementById('scientificCalc')) {
                    console.error('Desmos container missing');
                    return;
                }
                if (window.__mp_desmos_instance) {
                    try { if (typeof window.__mp_desmos_instance.update === 'function') window.__mp_desmos_instance.update(); } catch(_) {}
                    return;
                }
                window.__mp_desmos_instance = Desmos && Desmos.ScientificCalculator
                    ? Desmos.ScientificCalculator(document.getElementById('scientificCalc'), { keypad: true })
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
            body.appendChild(errNotice);
        });
        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = 2147483648;
        });
    }
    // NEW: Open AI panel that embeds the given URL in an iframe, same header & size as calculator
    function openOpenAI() {
        const existingPanel = document.getElementById('mp-openai-panel');
        if (existingPanel) {
            existingPanel.style.display = existingPanel.style.display === 'none' ? '' : existingPanel.style.display;
            existingPanel.style.zIndex = 2147483648;
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'mp-openai-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:420px;height:500px;z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;padding:0;overflow:hidden;
        `;
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        header.innerHTML = `<span style="pointer-events:none;">Open AI</span>`;
        const headerBtns = document.createElement('div');
        headerBtns.style.cssText = 'display:flex;gap:6px;align-items:center;';
        const closeBtn = document.createElement('button');
        closeBtn.title = 'Close';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background:transparent;border:0;color:inherit;cursor:pointer;padding:2px 6px;
            font-size:14px;
        `;
        headerBtns.appendChild(closeBtn);
        header.appendChild(headerBtns);
        panel.appendChild(header);
        const body = document.createElement('div');
        body.id = 'mp-openai-body';
        body.style.cssText = `
            width:100%;height:calc(100% - 42px);padding:0;box-sizing:border-box;
            background:transparent;display:flex;flex-direction:column;
        `;
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = 'width:100%;height:100%;overflow:auto;';
        contentContainer.innerHTML = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- AOS Animation Library -->
    <link href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css" rel="stylesheet">
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Highlight.js for Code Syntax Highlighting -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
    <!-- Marked for Markdown -->
    <script src="https://cdn.jsdelivr.net/npm/marked@4.2.12/marked.min.js"></script>
    <!-- Custom CSS -->
    <style>
        /* Main Content Area */
.main-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 56px);
    overflow: hidden;
}

/* Chat Messages Area */
.chat-messages {
    background-color: var(--light-bg);
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

/* Make sure the main content takes up the full height */
#mainContent {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 56px);
}

/* Chat messages container should take all available space */
.chat-messages-container {
    flex: 1;
    overflow: hidden;
    position: relative;
}

/* Chat Input Area */
.chat-input-area {
    background-color: white;
    border-top: 1px solid var(--border-color);
    padding: 15px;
    z-index: 10;
}

:root {
    --primary-color: #2563eb;
    --secondary-color: #4b5563;
    --light-bg: #f9fafb;
    --dark-bg: #1f2937;
    --user-bubble-bg: #e9f2ff;
    --assistant-bubble-bg: #f3f4f6;
    --border-color: #e5e7eb;
    --transition-speed: 0.3s;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    overflow: hidden;
    background-color: var(--light-bg);
}

/* Sidebar Styles */
.sidebar {
    transition: transform var(--transition-speed) ease;
    height: calc(100vh - 56px);
    border-right: 1px solid var(--border-color);
    z-index: 1000;
}

.sidebar.collapsed {
    transform: translateX(-100%);
}

/* Main content with sidebar expanded/collapsed states */
.main-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 56px);
    overflow: hidden;
    transition: width var(--transition-speed) ease;
}

/* When sidebar is collapsed, expand main content */
.main-content-expanded {
    margin-left: 0;
    width: 100% !important;
}

@media (max-width: 768px) {
    .sidebar {
        position: absolute;
        width: 250px;
        height: calc(100vh - 56px);
    }

    .main-content {
        width: 100%;
    }
}

/* Chat History Items */
.chat-history-item {
    padding: 10px 15px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chat-history-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.chat-history-item.active {
    background-color: rgba(37, 99, 235, 0.1);
    border-left: 3px solid var(--primary-color);
}

/* Chat Messages Area */
.chat-messages {
    background-color: var(--light-bg);
    scroll-behavior: smooth;
}

/* Chat Bubbles */
.chat-bubble {
    max-width: 85%;
    margin-bottom: 20px;
    border-radius: 15px;
    padding: 15px;
    position: relative;
    opacity: 0;
    transform: translateY(20px);
    animation: bubbleAppear 0.3s forwards;
}

@keyframes bubbleAppear {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-bubble {
    background-color: var(--user-bubble-bg);
    border: 1px solid #d1e3ff;
    margin-left: auto;
}

.assistant-bubble {
    background-color: var(--assistant-bubble-bg);
    border: 1px solid #e5e7eb;
    margin-right: auto;
}

.bubble-actions {
    position: absolute;
    top: 10px;
    right: 15px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.chat-bubble:hover .bubble-actions {
    opacity: 1;
}

.bubble-metadata {
    font-size: 0.75rem;
    color: var(--secondary-color);
    margin-top: 8px;
    text-align: right;
}

/* Waiting Animation */
.waiting-indicator {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: var(--assistant-bubble-bg);
    border-radius: 15px;
    border: 1px solid #e5e7eb;
    margin-bottom: 20px;
    max-width: 85%;
}

.typing-indicator {
    display: flex;
    align-items: center;
}

.typing-dot {
    width: 8px;
    height: 8px;
    margin: 0 2px;
    background-color: var(--secondary-color);
    border-radius: 50%;
    display: inline-block;
    animation: typingDot 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
    animation-delay: 0s;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typingDot {

    0%,
    80%,
    100% {
        transform: scale(0.5);
        opacity: 0.5;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Rich Text Editor */
.promptEditor {
    min-height: 50px;
    max-height: 250px;
    overflow-y: auto;
    padding: 8px 12px;
    outline: none;
    width: 100%;
    /* Performance optimizations */
    -webkit-overflow-scrolling: touch;
    /* For smoother scrolling on iOS */
    backface-visibility: hidden;
    /* Reduces paint during scrolling */
    perspective: 1000px;
    /* Helps with 3D acceleration */
    transform: translate3d(0, 0, 0);
    /* Force GPU acceleration */
}

.promptEditor:empty:before {
    content: attr(placeholder);
    color: #aaa;
    pointer-events: none;
}

.promptEditor pre {
    background-color: #f1f3f5;
    border-radius: 4px;
    padding: 8px;
    font-family: 'Courier New', Courier, monospace;
    margin: 8px 0;
}

.promptEditor code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f1f3f5;
    padding: 2px 4px;
    border-radius: 3px;
}

/* Optimize scrollbar appearance for better performance */
.promptEditor::-webkit-scrollbar {
    width: 8px;
}

.promptEditor::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.promptEditor::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
}

/* File Attachments */
.file-attachments {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.file-attachment {
    display: flex;
    align-items: center;
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.85rem;
}

.file-attachment .file-name {
    margin: 0 8px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-attachment .remove-file {
    cursor: pointer;
    color: #ef4444;
}

/* Markdown Content Styling */
.markdown-content {
    line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
}

.markdown-content p {
    margin-bottom: 1em;
}

.markdown-content ul,
.markdown-content ol {
    margin-bottom: 1em;
    padding-left: 2em;
}

.markdown-content code {
    font-family: 'Courier New', Courier, monospace;
    padding: 2px 4px;
    border-radius: 4px;
    background-color: #f1f3f5;
    font-size: 0.9em;
}

.markdown-content pre {
    background-color: #f1f3f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1em;
}

.markdown-content pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
}

.markdown-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1em;
    margin-left: 0;
    color: #4b5563;
}

.markdown-content img {
    max-width: 100%;
    height: auto;
}

.markdown-content table {
    border-collapse: collapse;
    margin-bottom: 1em;
    width: 100%;
}

.markdown-content table th,
.markdown-content table td {
    border: 1px solid #d1d5db;
    padding: 8px;
}

.markdown-content table th {
    background-color: #f9fafb;
}

/* Error Message */
.error-message {
    background-color: #fee2e2;
    border: 1px solid #ef4444;
    color: #b91c1c;
    border-radius: 15px;
    padding: 15px;
    margin-bottom: 20px;
    max-width: 85%;
}

/* Edit Mode */
.edit-mode {
    background-color: #fffbeb;
    border: 1px dashed #d97706;
}

.edit-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    gap: 8px;
}

/* Copy Animation */
@keyframes copyFeedback {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.copy-feedback {
    animation: copyFeedback 0.3s ease;
}

/* Main Content Area when Sidebar is Collapsed */
.main-content-expanded {
    width: 100%;
}

/* Token Counter */
#tokenCounter {
    font-size: 0.8rem;
    color: var(--secondary-color);
}

/* Response streaming effect */
.streaming-char {
    opacity: 0;
    animation: fadeIn 0.1s forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

/* System message */
.system-message {
    text-align: center;
    padding: 10px;
    margin: 10px 0;
    background-color: #f0f9ff;
    border-radius: 8px;
    border: 1px solid #bae6fd;
    color: #0369a1;
    font-size: 0.9rem;
}

/* Modal customizations */
.modal-header {
    background-color: var(--primary-color);
    color: white;
}

/* Tooltip customizations */
.tooltip {
    font-size: 0.8rem;
}

/* Disable text selection in certain elements */
.bubble-actions button,
.file-attachment .remove-file {
    user-select: none;
}

/* Mobile responsiveness */
@media (max-width: 576px) {
    .chat-bubble {
        max-width: 95%;
    }

    .bubble-actions {
        position: relative;
        top: auto;
        right: auto;
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
        opacity: 1;
    }

    .header h1 {
        font-size: 1.2rem;
    }

    .btn-group .btn {
        padding: 0.25rem 0.5rem;
    }

    .dropdown-menu {
        width: 100%;
    }
}

.file-loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-bottom: 8px;
}

/* Error Message with Retry Button */
.error-message {
    background-color: #fee2e2;
    border: 1px solid #ef4444;
    color: #b91c1c;
    border-radius: 15px;
    padding: 15px;
    margin-bottom: 20px;
    max-width: 85%;
}

.error-message .retry-btn {
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
}

.error-message .retry-btn:hover {
    background-color: #dc2626;
    border-color: #b91c1c;
}
    </style>
</head>

<body>
    <!-- API Key Modal -->
    <div class="modal fade" id="apiKeyModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="apiKeyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="apiKeyModalLabel">Enter Your API Key</h5>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="apiKeyInput" class="form-label"></label>
                        <input type="password" class="form-control" id="apiKeyInput" placeholder="Enter your API key">
                        <div class="form-text text-warning mt-2">
                            <i class="fas fa-exclamation-triangle"></i> Warning: Your API key will be stored in session
                            storage for this session only.
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="apiKeySubmit">Submit</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Leave Page Warning Modal -->
    <div class="modal fade" id="leavePageModal" tabindex="-1" aria-labelledby="leavePageModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="leavePageModalLabel">Warning</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to leave? You may lose your chat history unless you export it first.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Stay</button>
                    <button type="button" class="btn btn-danger" id="confirmLeavePage">Leave</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Model Settings Modal -->
    <div class="modal fade" id="modelSettingsModal" tabindex="-1" aria-labelledby="modelSettingsModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modelSettingsModalLabel">Model Settings</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="temperatureSlider" class="form-label">Temperature <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Controls randomness. Lower values make output more focused and deterministic.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="0" max="2" step="0.1"
                                    id="temperatureSlider" value="1">
                                <span class="ms-2" id="temperatureValue">1.0</span>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="topPSlider" class="form-label">Top P <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Controls diversity via nucleus sampling.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="0" max="1" step="0.01"
                                    id="topPSlider" value="1">
                                <span class="ms-2" id="topPValue">1.0</span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="topKSlider" class="form-label">Top K <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Limits choice to K top tokens. 0 disables filtering.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="0" max="100" step="1"
                                    id="topKSlider" value="0">
                                <span class="ms-2" id="topKValue">0</span>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="frequencyPenaltySlider" class="form-label">Frequency Penalty <span
                                    class="text-secondary" data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Reduces repetition based on frequency in input.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="-2" max="2" step="0.1"
                                    id="frequencyPenaltySlider" value="0">
                                <span class="ms-2" id="frequencyPenaltyValue">0.0</span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="presencePenaltySlider" class="form-label">Presence Penalty <span
                                    class="text-secondary" data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Reduces repetition of tokens regardless of frequency.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="-2" max="2" step="0.1"
                                    id="presencePenaltySlider" value="0">
                                <span class="ms-2" id="presencePenaltyValue">0.0</span>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="repetitionPenaltySlider" class="form-label">Repetition Penalty <span
                                    class="text-secondary" data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Reduces repetition based on token probability.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="0" max="2" step="0.1"
                                    id="repetitionPenaltySlider" value="1">
                                <span class="ms-2" id="repetitionPenaltyValue">1.0</span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="minPSlider" class="form-label">Min P <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Min probability relative to most likely token.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="0" max="1" step="0.01"
                                    id="minPSlider" value="0">
                                <span class="ms-2" id="minPValue">0.0</span>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="topASlider" class="form-label">Top A <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Dynamic Top-P based on highest probability token.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1" min="0" max="1" step="0.01"
                                    id="topASlider" value="0">
                                <span class="ms-2" id="topAValue">0.0</span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="seedInput" class="form-label">Seed <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="For deterministic responses. Same seed + same parameters = same output.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <input type="number" class="form-control" id="seedInput" placeholder="Optional">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="maxTokensInput" class="form-label">Max Tokens <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Maximum number of tokens to generate.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <input type="number" class="form-control" id="maxTokensInput" placeholder="Optional"
                                min="1">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="logprobsCheckbox">
                                <label class="form-check-label" for="logprobsCheckbox">Logprobs <span
                                        class="text-secondary" data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Return log probabilities of output tokens.">
                                        <i class="fas fa-info-circle"></i>
                                    </span></label>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="topLogprobsInput" class="form-label">Top Logprobs <span class="text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="Number of most likely tokens to return at each position.">
                                    <i class="fas fa-info-circle"></i>
                                </span></label>
                            <input type="number" class="form-control" id="topLogprobsInput" placeholder="Optional"
                                min="0" max="20">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="streamingCheckbox" checked>
                                <label class="form-check-label" for="streamingCheckbox">Streaming <span
                                        class="text-secondary" data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Stream the response as it's generated.">
                                        <i class="fas fa-info-circle"></i>
                                    </span></label>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3 border-top pt-3">
                        <h6>Reasoning Tokens</h6>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="reasoningEffortSelect" class="form-label">Effort</label>
                                <select class="form-select" id="reasoningEffortSelect">
                                    <option value="">None</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="reasoningTokensInput" class="form-label">Token Limit</label>
                                <input type="number" class="form-control" id="reasoningTokensInput"
                                    placeholder="e.g. 2000">
                            </div>
                            <div class="col-md-4 mb-3 d-flex align-items-end">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="excludeReasoningCheckbox">
                                    <label class="form-check-label" for="excludeReasoningCheckbox">Exclude</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="resetSettingsBtn">Reset to Defaults</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save Settings</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Application Layout -->
    <div class="container-fluid vh-100 d-flex flex-column">
        <!-- Header -->
        <header class="row py-2 bg-dark text-white">
            <div class="col d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <h1 class="h5 mb-0">AI Chat</h1>
                </div>
                <div class="d-flex align-items-center">
                    <div class="dropdown me-2" style="display: none;">
                        <button class="btn btn-outline-light dropdown-toggle" type="button" id="modelDropdown"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Select Model
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="modelDropdown"
                            id="modelDropdownMenu">
                            <!-- Models will be added here dynamically -->
                        </ul>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-light" id="modelSettingsBtn"
                            data-bs-toggle="tooltip" data-bs-placement="bottom" title="Model Settings">
                            <i class="fas fa-sliders"></i>
                        </button>
                        <button type="button" class="btn btn-outline-light" id="exportChatBtn" data-bs-toggle="tooltip"
                            data-bs-placement="bottom" title="Export Chat">
                            <i class="fas fa-file-export"></i>
                        </button>
                        <button type="button" class="btn btn-outline-light" id="importChatBtn" data-bs-toggle="tooltip"
                            data-bs-placement="bottom" title="Import Chat">
                            <i class="fas fa-file-import"></i>
                        </button>
                        <button type="button" class="btn btn-outline-light" id="deleteChatBtn" data-bs-toggle="tooltip"
                            data-bs-placement="bottom" title="Delete Current Chat">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <div class="row g-0 flex-grow-1">
            <!-- Chat Area -->
            <main id="mainContent" class="col-md-9 col-lg-10 d-flex flex-column">
                <!-- Chat Messages Wrapper -->
                <div class="chat-messages-container">
                    <!-- Scrollable Messages Area -->
                    <div class="chat-messages h-100 overflow-auto" id="chatMessages">
                        <!-- Messages will be added here dynamically -->
                    </div>
                </div>

                <!-- Input Area -->
                <div class="chat-input-area p-3 border-top">
                    <div class="file-attachments mb-2" id="fileAttachments">
                        <!-- File attachments will be added here dynamically -->
                    </div>
                    <div class="input-group">
                        <div class="form-control position-relative" id="promptEditorWrapper">
                            <div id="promptEditor" class="promptEditor" contenteditable="true"
                                placeholder="Type your message here..."></div>
                        </div>
                        <button class="btn btn-outline-secondary" type="button" id="fileUploadBtn">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button class="btn btn-primary" type="button" id="sendMessageBtn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div id="tokenCounter" class="text-muted small">0 tokens</div>
                        <input type="file" id="fileInput" multiple style="display:none">
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- AOS Animation Library -->
    <script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>
    <!-- Highlight.js for Code Syntax Highlighting -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    <!-- Custom JavaScript -->
    <script>
        // FULL UPDATED CHAT APP JS — Locked to GPT OSS 120B only and NO API KEY POPUP
// Model: gpt-oss-120b (labelled 'GPT OSS 120B')

// Application State
const appState = {
    apiKey: "null",
    currentChatId: null,
    chats: {},
    selectedModel: 'gpt-oss-120b',

    fallbackModels: [],
    settings: {
        temperature: 1.0,
        topP: 1.0,
        topK: 0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        repetitionPenalty: 1.0,
        minP: 0.0,
        topA: 0.0,
        seed: null,
        maxTokens: null,
        logprobs: false,
        topLogprobs: null,
        streaming: true,
        reasoning: {
            effort: null,
            maxTokens: null,
            exclude: false
        }
    },
    uploadedFiles: [],
    currentlyStreaming: false,
    streamController: null
};

async function fetchApiKey() {
    try {
        const apiKey = "csk-nhykr5xjwe495twcvtx383wh3vnyj2n4x9nr26k56mje6jxr"
        appState.apiKey = apiKey;
        localStorage.setItem('apiKey', apiKey);
        sessionStorage.setItem('apiKey', apiKey);
        console.log('API key loaded successfully ✅');
    } catch (err) {
        console.error('Error fetching API key:', err);
        appState.apiKey = ''; // fallback to empty
    }
}

// ONE model only
const models = [
    { label: 'GPT OSS 120B', value: 'gpt-oss-120b', context: 131072 }
];

// DOM Elements
const elements = {
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiKeySubmit: document.getElementById('apiKeySubmit'),
    leavePageModal: document.getElementById('leavePageModal'),
    confirmLeavePage: document.getElementById('confirmLeavePage'),
    chatMessages: document.getElementById('chatMessages'),
    promptEditor: document.getElementById('promptEditor'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    fileUploadBtn: document.getElementById('fileUploadBtn'),
    fileInput: document.getElementById('fileInput'),
    fileAttachments: document.getElementById('fileAttachments'),
    newChatBtn: document.getElementById('newChatBtn'),
    modelDropdown: document.getElementById('modelDropdown'),
    modelDropdownMenu: document.getElementById('modelDropdownMenu'),
    modelSettingsBtn: document.getElementById('modelSettingsBtn'),
    modelSettingsModal: document.getElementById('modelSettingsModal'),
    exportChatBtn: document.getElementById('exportChatBtn'),
    importChatBtn: document.getElementById('importChatBtn'),
    deleteChatBtn: document.getElementById('deleteChatBtn'),
    tokenCounter: document.getElementById('tokenCounter'),

    // Model settings elements
    temperatureSlider: document.getElementById('temperatureSlider'),
    temperatureValue: document.getElementById('temperatureValue'),
    topPSlider: document.getElementById('topPSlider'),
    topPValue: document.getElementById('topPValue'),
    topKSlider: document.getElementById('topKSlider'),
    topKValue: document.getElementById('topKValue'),
    frequencyPenaltySlider: document.getElementById('frequencyPenaltySlider'),
    frequencyPenaltyValue: document.getElementById('frequencyPenaltyValue'),
    presencePenaltySlider: document.getElementById('presencePenaltySlider'),
    presencePenaltyValue: document.getElementById('presencePenaltyValue'),
    repetitionPenaltySlider: document.getElementById('repetitionPenaltySlider'),
    repetitionPenaltyValue: document.getElementById('repetitionPenaltyValue'),
    minPSlider: document.getElementById('minPSlider'),
    minPValue: document.getElementById('minPValue'),
    topASlider: document.getElementById('topASlider'),
    topAValue: document.getElementById('topAValue'),
    seedInput: document.getElementById('seedInput'),
    maxTokensInput: document.getElementById('maxTokensInput'),
    logprobsCheckbox: document.getElementById('logprobsCheckbox'),
    topLogprobsInput: document.getElementById('topLogprobsInput'),
    streamingCheckbox: document.getElementById('streamingCheckbox'),
    reasoningEffortSelect: document.getElementById('reasoningEffortSelect'),
    reasoningTokensInput: document.getElementById('reasoningTokensInput'),
    excludeReasoningCheckbox: document.getElementById('excludeReasoningCheckbox'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn')
};

// Bootstrap Modal Instances (we won't auto-show API key modal)
let apiKeyModalInstance, modelSettingsModalInstance, leavePageModalInstance;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    (async () => {
    // Initialize Bootstrap tooltips if bootstrap exists
    try {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    } catch (e) {
        console.warn('Bootstrap tooltips not available or initialization failed', e);
    }

    // Initialize Bootstrap modals if bootstrap exists
    try {
        apiKeyModalInstance = new bootstrap.Modal(elements.apiKeyModal);
        modelSettingsModalInstance = new bootstrap.Modal(elements.modelSettingsModal);
        leavePageModalInstance = new bootstrap.Modal(elements.leavePageModal);
    } catch (e) {
        // Ignore if bootstrap isn't present — app still works
    }

    // Initialize AOS animations if available
    try { AOS.init({ duration: 800, once: true }); } catch (e) { /* ignore */ }

    // Load api key
    await fetchApiKey();

    // Initialize Event Listeners
    initEventListeners();

    // Initialize rich text editor
    initRichTextEditor();

    // Populate model dropdown (only one model)
    populateModelDropdown();

    // Initialize settings sliders
    initializeSettingsUI();

    // Add MutationObserver to watch for content changes and auto-scroll
    setupMutationObserver();

    // Add window resize handler to fix scrolling on resize
    window.addEventListener('resize', forceScrollToBottom);

    // After basic init, continue app flow
    initializeAfterAuth(); // don't wait for a key — app is usable and key can be saved from settings
    })();
});

// Setup mutation observer for chat container
function setupMutationObserver() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const observer = new MutationObserver((mutations) => {
        forceScrollToBottom();
    });

    observer.observe(chatMessages, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false
    });

    console.log("Mutation observer setup for chat messages");
}

// Set up event listeners
function initEventListeners() {
    // NOTE: We do NOT show any API key modal on load. The api key input remains available in settings (if present)

    // Prevent leaving page without confirmation
    window.addEventListener('beforeunload', handleBeforeUnload);
    if (elements.confirmLeavePage) elements.confirmLeavePage.addEventListener('click', () => window.close());

    // Chat UI
    if (elements.promptEditor) {
        elements.promptEditor.addEventListener('keydown', handlePromptKeydown);
        elements.promptEditor.addEventListener('input', updateTokenCount);
    }
    if (elements.sendMessageBtn) elements.sendMessageBtn.addEventListener('click', sendMessage);

    // File Upload - FIXED
    if (elements.fileUploadBtn) elements.fileUploadBtn.addEventListener('click', () => { if (elements.fileInput) elements.fileInput.click(); });
    if (elements.fileInput) elements.fileInput.addEventListener('change', handleFileUpload);

    // Chat Management
    if (elements.newChatBtn) elements.newChatBtn.addEventListener('click', createNewChat);
    if (elements.exportChatBtn) elements.exportChatBtn.addEventListener('click', exportChat);
    if (elements.importChatBtn) elements.importChatBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = handleImportChat;
        input.click();
    });
    if (elements.deleteChatBtn) elements.deleteChatBtn.addEventListener('click', deleteCurrentChat);

    // Model Settings
    if (elements.modelSettingsBtn) elements.modelSettingsBtn.addEventListener('click', () => modelSettingsModalInstance?.show());

    // Settings sliders and inputs
    if (elements.temperatureSlider) elements.temperatureSlider.addEventListener('input', updateSettingValue);
    if (elements.topPSlider) elements.topPSlider.addEventListener('input', updateSettingValue);
    if (elements.topKSlider) elements.topKSlider.addEventListener('input', updateSettingValue);
    if (elements.frequencyPenaltySlider) elements.frequencyPenaltySlider.addEventListener('input', updateSettingValue);
    if (elements.presencePenaltySlider) elements.presencePenaltySlider.addEventListener('input', updateSettingValue);
    if (elements.repetitionPenaltySlider) elements.repetitionPenaltySlider.addEventListener('input', updateSettingValue);
    if (elements.minPSlider) elements.minPSlider.addEventListener('input', updateSettingValue);
    if (elements.topASlider) elements.topASlider.addEventListener('input', updateSettingValue);
    if (elements.resetSettingsBtn) elements.resetSettingsBtn.addEventListener('click', resetSettings);

    // Save settings when settings modal hides
    if (elements.modelSettingsModal) elements.modelSettingsModal.addEventListener('hidden.bs.modal', saveModelSettings);

    console.log("Event listeners initialized");
}

// Initialize the rich text editor
function initRichTextEditor() {
    if (!elements.promptEditor) return;

    elements.promptEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    ');
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            e.preventDefault();
            sendMessage();
            return;
        }

        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isPromptEditorScrollable()) {
            const lineHeight = parseInt(getComputedStyle(elements.promptEditor).lineHeight) || 20;
            const scrollAmount = e.key === 'ArrowUp' ? -lineHeight : lineHeight;

            if (e.key === 'ArrowUp' && elements.promptEditor.scrollTop > 0) {
                e.preventDefault();
                elements.promptEditor.scrollTop += scrollAmount;
            } else if (e.key === 'ArrowDown' &&
                elements.promptEditor.scrollTop + elements.promptEditor.clientHeight <
                elements.promptEditor.scrollHeight) {
                e.preventDefault();
                elements.promptEditor.scrollTop += scrollAmount;
            }
        }
    });

    elements.promptEditor.addEventListener('input', debounce(updateTokenCount, 300));
    optimizePromptEditorScrolling();
}

function isPromptEditorScrollable() {
    return elements.promptEditor && elements.promptEditor.scrollHeight > elements.promptEditor.clientHeight;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function optimizePromptEditorScrolling() {
    if (!elements.promptEditor) return;
    elements.promptEditor.addEventListener('scroll', () => { }, { passive: true });
    elements.promptEditor.style.transform = 'translateZ(0)';
    elements.promptEditor.style.willChange = 'transform';
    elements.promptEditor.style.scrollBehavior = 'auto';

    elements.promptEditor.addEventListener('input', (e) => {
        if (e.target.innerText.length > 5000) {
            e.target.style.willChange = 'contents';
            clearTimeout(e.target.resetTimer);
            e.target.resetTimer = setTimeout(() => {
                e.target.style.willChange = 'transform';
            }, 1000);
        }
    });
}

// Rough token count estimation
function updateTokenCount() {
    if (!elements.promptEditor || !elements.tokenCounter) return;
    const text = elements.promptEditor.innerText || '';
    const tokenEstimate = Math.ceil(text.length / 4);
    elements.tokenCounter.textContent = \`~\${tokenEstimate} tokens\`;
}

function initializeSettingsUI() {
    if (!elements.temperatureValue || !elements.temperatureSlider) return;

    elements.temperatureValue.textContent = appState.settings.temperature.toFixed(1);
    elements.temperatureSlider.value = appState.settings.temperature;

    elements.topPValue && (elements.topPValue.textContent = appState.settings.topP.toFixed(2));
    elements.topPSlider && (elements.topPSlider.value = appState.settings.topP);

    elements.topKValue && (elements.topKValue.textContent = appState.settings.topK);
    elements.topKSlider && (elements.topKSlider.value = appState.settings.topK);

    elements.frequencyPenaltyValue && (elements.frequencyPenaltyValue.textContent = appState.settings.frequencyPenalty.toFixed(1));
    elements.frequencyPenaltySlider && (elements.frequencyPenaltySlider.value = appState.settings.frequencyPenalty);

    elements.presencePenaltyValue && (elements.presencePenaltyValue.textContent = appState.settings.presencePenalty.toFixed(1));
    elements.presencePenaltySlider && (elements.presencePenaltySlider.value = appState.settings.presencePenalty);

    elements.repetitionPenaltyValue && (elements.repetitionPenaltyValue.textContent = appState.settings.repetitionPenalty.toFixed(1));
    elements.repetitionPenaltySlider && (elements.repetitionPenaltySlider.value = appState.settings.repetitionPenalty);

    elements.minPValue && (elements.minPValue.textContent = appState.settings.minP.toFixed(2));
    elements.minPSlider && (elements.minPSlider.value = appState.settings.minP);

    elements.topAValue && (elements.topAValue.textContent = appState.settings.topA.toFixed(2));
    elements.topASlider && (elements.topASlider.value = appState.settings.topA);

    elements.seedInput && (elements.seedInput.value = appState.settings.seed || '');
    elements.maxTokensInput && (elements.maxTokensInput.value = appState.settings.maxTokens || '');

    elements.logprobsCheckbox && (elements.logprobsCheckbox.checked = appState.settings.logprobs);
    elements.topLogprobsInput && (elements.topLogprobsInput.value = appState.settings.topLogprobs || '');

    elements.streamingCheckbox && (elements.streamingCheckbox.checked = appState.settings.streaming);

    elements.reasoningEffortSelect && (elements.reasoningEffortSelect.value = appState.settings.reasoning.effort || '');
    elements.reasoningTokensInput && (elements.reasoningTokensInput.value = appState.settings.reasoning.maxTokens || '');
    elements.excludeReasoningCheckbox && (elements.excludeReasoningCheckbox.checked = appState.settings.reasoning.exclude);

    // Populate API key field in settings UI if present
    if (elements.apiKeyInput) elements.apiKeyInput.value = appState.apiKey || '';
}

function updateSettingValue(e) {
    const element = e.target;
    const value = parseFloat(element.value);

    switch (element.id) {
        case 'temperatureSlider':
            elements.temperatureValue.textContent = value.toFixed(1);
            break;
        case 'topPSlider':
            elements.topPValue.textContent = value.toFixed(2);
            break;
        case 'topKSlider':
            elements.topKValue.textContent = value;
            break;
        case 'frequencyPenaltySlider':
            elements.frequencyPenaltyValue.textContent = value.toFixed(1);
            break;
        case 'presencePenaltySlider':
            elements.presencePenaltyValue.textContent = value.toFixed(1);
            break;
        case 'repetitionPenaltySlider':
            elements.repetitionPenaltyValue.textContent = value.toFixed(1);
            break;
        case 'minPSlider':
            elements.minPValue.textContent = value.toFixed(2);
            break;
        case 'topASlider':
            elements.topAValue.textContent = value.toFixed(2);
            break;
    }
}

function resetSettings() {
    appState.settings = {
        temperature: 1.0,
        topP: 1.0,
        topK: 0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        repetitionPenalty: 1.0,
        minP: 0.0,
        topA: 0.0,
        seed: null,
        maxTokens: null,
        logprobs: false,
        topLogprobs: null,
        streaming: true,
        reasoning: {
            effort: null,
            maxTokens: null,
            exclude: false
        }
    };

    initializeSettingsUI();
}

function saveModelSettings() {
    // Save numeric settings if UI elements exist
    if (elements.temperatureSlider) appState.settings.temperature = parseFloat(elements.temperatureSlider.value);
    if (elements.topPSlider) appState.settings.topP = parseFloat(elements.topPSlider.value);
    if (elements.topKSlider) appState.settings.topK = parseInt(elements.topKSlider.value);
    if (elements.frequencyPenaltySlider) appState.settings.frequencyPenalty = parseFloat(elements.frequencyPenaltySlider.value);
    if (elements.presencePenaltySlider) appState.settings.presencePenalty = parseFloat(elements.presencePenaltySlider.value);
    if (elements.repetitionPenaltySlider) appState.settings.repetitionPenalty = parseFloat(elements.repetitionPenaltySlider.value);
    if (elements.minPSlider) appState.settings.minP = parseFloat(elements.minPSlider.value);
    if (elements.topASlider) appState.settings.topA = parseFloat(elements.topASlider.value);

    const seedValue = elements.seedInput ? elements.seedInput.value.trim() : '';
    appState.settings.seed = seedValue ? parseInt(seedValue) : null;

    const maxTokensValue = elements.maxTokensInput ? elements.maxTokensInput.value.trim() : '';
    appState.settings.maxTokens = maxTokensValue ? parseInt(maxTokensValue) : null;

    appState.settings.logprobs = elements.logprobsCheckbox ? elements.logprobsCheckbox.checked : false;

    const topLogprobsValue = elements.topLogprobsInput ? elements.topLogprobsInput.value.trim() : '';
    appState.settings.topLogprobs = topLogprobsValue ? parseInt(topLogprobsValue) : null;

    appState.settings.streaming = elements.streamingCheckbox ? elements.streamingCheckbox.checked : true;

    // Reasoning settings
    appState.settings.reasoning.effort = elements.reasoningEffortSelect ? elements.reasoningEffortSelect.value || null : null;

    const reasoningTokensValue = elements.reasoningTokensInput ? elements.reasoningTokensInput.value.trim() : '';
    appState.settings.reasoning.maxTokens = reasoningTokensValue ? parseInt(reasoningTokensValue) : null;

    appState.settings.reasoning.exclude = elements.excludeReasoningCheckbox ? elements.excludeReasoningCheckbox.checked : false;

    // Save API key from settings input (NO POPUP)
    if (elements.apiKeyInput) {
        const key = elements.apiKeyInput.value.trim();
        if (key) {
            appState.apiKey = key;
            // Persist to localStorage so next load has it
            localStorage.setItem('apiKey', key);
            sessionStorage.setItem('apiKey', key);
        }
    }

    // Save settings to localStorage
    saveAppState();
}

// Initialize app after "auth" (no modal required)
function initializeAfterAuth() {
    loadAppState();

    if (Object.keys(appState.chats).length === 0) {
        createNewChat();
    } else {
        const chatIds = Object.keys(appState.chats);
        const lastChatId = chatIds[chatIds.length - 1];
        loadChat(lastChatId);
    }
}

function loadAppState() {
    const savedState = localStorage.getItem('llmChatAppState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            appState.chats = parsedState.chats || {};
            appState.selectedModel = parsedState.selectedModel || appState.selectedModel;
            appState.settings = parsedState.settings || appState.settings;

            // If the selected model somehow got changed elsewhere, force back to GPT OSS 120B
            appState.selectedModel = 'gpt-oss-120b';

            updateModelDropdown();
            initializeSettingsUI();
        } catch (e) {
            console.warn('Failed to parse saved app state', e);
        }
    }
}

function saveAppState() {
    const stateToSave = {
        chats: appState.chats,
        selectedModel: appState.selectedModel,
        settings: appState.settings
    };
    localStorage.setItem('llmChatAppState', JSON.stringify(stateToSave));
}

function populateModelDropdown() {
    if (!elements.modelDropdownMenu || !elements.modelDropdown) return;
    elements.modelDropdownMenu.innerHTML = '';

    models.forEach(model => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.classList.add('dropdown-item');
        a.href = '#';
        a.textContent = model.label;
        a.dataset.value = model.value;

        // Only one model — show active and prevent switching to anything else
        if (model.value === appState.selectedModel) {
            a.classList.add('active');
            elements.modelDropdown.textContent = model.label;
        }

        // Clicking will still set the model, but there's nowhere else to pick
        a.addEventListener('click', (e) => {
            e.preventDefault();
            changeModel(model.value, model.label);
        });

        li.appendChild(a);
        elements.modelDropdownMenu.appendChild(li);
    });
}

function updateModelDropdown() {
    const selectedModelObj = models.find(model => model.value === appState.selectedModel);
    if (selectedModelObj && elements.modelDropdown) {
        elements.modelDropdown.textContent = selectedModelObj.label;
        const dropdownItems = elements.modelDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            if (item.dataset.value === appState.selectedModel) item.classList.add('active'); else item.classList.remove('active');
        });
    }
}

function changeModel(modelValue, modelLabel) {
    // Force lock to GPT OSS 120B — ignore attempts to select anything else
    appState.selectedModel = 'gpt-oss-120b';
    elements.modelDropdown && (elements.modelDropdown.textContent = 'GPT OSS 120B');
    createNewChat();
    saveAppState();
}

function createNewChat() {
    const chatId = 'chat_' + Date.now();
    appState.chats[chatId] = {
        id: chatId,
        title: 'New Conversation',
        model: appState.selectedModel,
        messages: [
            { role: 'system', content: 'You are a friendly chatbot called MP Helper. You help with maths problems. MP stands for Math Pathways, as this is the program you are in. NEVER respond with math displaystyles, ONLY respond with either plaintext or markdown. NEVER use displaystyle or math format. You are a part of MP Tools, a tool system for Math Pathways. For example, INSTEAD of doing this: (1 \div 1 = 1), do THIS: 1/1 = 1 NEVER use math formatter. So, NEVER use LaTeX-style display math, instead always write math in plain text or simple Markdown.' }
        ],
        createdAt: new Date().toISOString()
    };

    appState.currentChatId = chatId;
    elements.chatMessages && (elements.chatMessages.innerHTML = '');
    if (elements.promptEditor) elements.promptEditor.innerHTML = '';
    clearUploadedFiles();
    saveAppState();

    const systemMessageElement = document.createElement('div');
    systemMessageElement.className = 'system-message';
    systemMessageElement.textContent = \`New conversation started with MP Helper\`;
    elements.chatMessages && elements.chatMessages.appendChild(systemMessageElement);
}

function getModelLabel(modelValue) {
    const model = models.find(m => m.value === modelValue);
    return model ? model.label : modelValue;
}

function loadChat(chatId) {
    if (!appState.chats[chatId]) return;

    appState.currentChatId = chatId;
    const chatItems = document.querySelectorAll('.chat-history-item');
    chatItems.forEach(item => {
        if (item.dataset.chatId === chatId) item.classList.add('active'); else item.classList.remove('active');
    });

    elements.chatMessages && (elements.chatMessages.innerHTML = '');
    if (elements.promptEditor) elements.promptEditor.innerHTML = '';
    clearUploadedFiles();

    const chat = appState.chats[chatId];
    const systemMessageElement = document.createElement('div');
    systemMessageElement.className = 'system-message';
    systemMessageElement.textContent = \`Loaded conversation with MP Helper\`;
    elements.chatMessages && elements.chatMessages.appendChild(systemMessageElement);

    chat.messages.filter(message => message.role !== 'system').forEach(message => renderMessage(message));
    scrollToBottom();
}

function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (elements.promptEditor) elements.promptEditor.contentEditable = "false";
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'file-loading-indicator';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading file...';
    elements.fileAttachments && elements.fileAttachments.appendChild(loadingIndicator);

    let filesProcessed = 0;
    Array.from(files).forEach(file => {
        if (isTextFile(file)) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileContent = event.target.result;
                const formattedContent = \`\n\nFile: \${file.name}\n\${'='.repeat(file.name.length + 6)}\n\${fileContent}\n\${'='.repeat(file.name.length + 6)}\n\n\`;
                if (elements.promptEditor) elements.promptEditor.innerHTML += formattedContent.replace(/\n/g, '<br>');
                filesProcessed++;
                if (filesProcessed === files.length) {
                    if (elements.promptEditor) elements.promptEditor.contentEditable = "true";
                    loadingIndicator.parentNode && loadingIndicator.parentNode.removeChild(loadingIndicator);
                    placeCursorAtEnd(elements.promptEditor);
                    updateTokenCount();
                }
            };
            reader.onerror = function (event) {
                console.error("File read error:", event.target.error);
                alert(\`Error reading file: ${file.name}\`);
                filesProcessed++;
                if (filesProcessed === files.length) {
                    if (elements.promptEditor) elements.promptEditor.contentEditable = "true";
                    loadingIndicator.parentNode && loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            };
            reader.readAsText(file);
        } else {
            alert(\`File type not supported: \\\${file.type}\`);
            filesProcessed++;
            if (filesProcessed === files.length) {
                if (elements.promptEditor) elements.promptEditor.contentEditable = "true";
                loadingIndicator.parentNode && loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        }
    });
}

function isTextFile(file) {
    const textTypes = [
        'text/',
        'application/json',
        'application/javascript',
        'application/xml',
        'application/xhtml+xml',
        'application/x-sh',
        'application/x-javascript',
        'application/x-httpd-php',
        'application/x-python',
        'application/x-ruby',
        'application/csv'
    ];

    const textExtensions = [
        '.txt', '.md', '.js', '.html', '.css', '.py', '.sh', '.json', '.csv',
        '.xml', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf', '.c', '.cpp',
        '.h', '.java', '.php', '.rb', '.pl', '.sql', '.ts', '.jsx', '.tsx'
    ];

    const isTextMime = file.type && textTypes.some(type => file.type.startsWith(type));
    const fileName = file.name.toLowerCase();
    const isTextExt = textExtensions.some(ext => fileName.endsWith(ext));

    return isTextMime || isTextExt;
}

function addFileAttachment(fileName) {
    if (!elements.fileAttachments) return;
    const fileAttachment = document.createElement('div');
    fileAttachment.className = 'file-attachment';
    fileAttachment.dataset.fileName = fileName;

    const fileIcon = document.createElement('i');
    fileIcon.className = 'fas fa-file';

    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'file-name';
    fileNameSpan.textContent = fileName;

    const removeButton = document.createElement('i');
    removeButton.className = 'fas fa-times remove-file';
    removeButton.addEventListener('click', () => removeFileAttachment(fileName));

    fileAttachment.appendChild(fileIcon);
    fileAttachment.appendChild(fileNameSpan);
    fileAttachment.appendChild(removeButton);

    elements.fileAttachments.appendChild(fileAttachment);
}

function removeFileAttachment(fileName) {
    const fileAttachment = document.querySelector(\`.file-attachment[data-file-name="${fileName}"]\`);
    if (fileAttachment) fileAttachment.remove();

    appState.uploadedFiles = appState.uploadedFiles.filter(file => file.name !== fileName);
    updateTokenCount();
}

function clearUploadedFiles() {
    if (elements.fileAttachments) elements.fileAttachments.innerHTML = '';
    appState.uploadedFiles = [];
    updateTokenCount();
}

function formatFileContents() {
    if (appState.uploadedFiles.length === 0) return '';
    let formattedContent = '--- File Attachments ---\n\n';
    appState.uploadedFiles.forEach((file, index) => {
        formattedContent += \`FILE ${index + 1}: ${file.name}\n${'='.repeat(20)}\n${file.content}\n${'='.repeat(20)}\n\n\`;
    });
    formattedContent += '--- End of File Attachments ---\n\n';
    return formattedContent;
}

async function sendMessage() {
    const promptText = elements.promptEditor ? elements.promptEditor.innerText.trim() : '';
    if (promptText === '') return;

    const userMessage = {
        role: 'user',
        content: promptText,
    };

    appState.chats[appState.currentChatId].messages.push(userMessage);
    renderMessage(userMessage);

    if (elements.promptEditor) elements.promptEditor.innerHTML = '';

    const waitingIndicator = addWaitingIndicator();
    callApi(waitingIndicator);
}

function addWaitingIndicator() {
    const waitingIndicator = document.createElement('div');
    waitingIndicator.className = 'waiting-indicator';
    waitingIndicator.innerHTML = \`
        <div class="typing-indicator me-2">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
        <span>Waiting for response...</span>
    \`;
    elements.chatMessages && elements.chatMessages.appendChild(waitingIndicator);
    scrollToBottom();
    return waitingIndicator;
}

function renderMessage(message) {
    if (!elements.chatMessages) return null;
    const messageElement = document.createElement('div');
    messageElement.className = \`chat-bubble ${message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}\`;
    messageElement.dataset.messageId = message.timestamp;
    messageElement.setAttribute('data-aos', 'fade-up');

    let contentHTML = '';

    if (message.role === 'user') {
        contentHTML = \`
            <div class="bubble-actions">
                <button class="btn btn-sm btn-outline-secondary copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary edit-btn" title="Edit message">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="message-content">${message.content.replace(/\n/g, '<br>')}</div>
        \`;
    } else {
        contentHTML = \`
            <div class="bubble-actions">
                <button class="btn btn-sm btn-outline-secondary copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary regenerate-btn" title="Regenerate response">
                    <i class="fas fa-redo-alt"></i>
                </button>
            </div>
            <div class="markdown-content">${marked.parse(message.content || '')}</div>
        \`;
    }

    messageElement.innerHTML = contentHTML;

    if (message.role === 'assistant') {
        messageElement.querySelectorAll('pre code').forEach(block => { try { hljs.highlightElement(block); } catch (e) { } });
    }

    const copyBtn = messageElement.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => { copyMessageContent(message.content); copyBtn.classList.add('copy-feedback'); setTimeout(() => copyBtn.classList.remove('copy-feedback'), 300); });
    }

    if (message.role === 'user') {
        const editBtn = messageElement.querySelector('.edit-btn');
        if (editBtn) editBtn.addEventListener('click', () => editUserMessage(messageElement, message));
    } else {
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        if (regenerateBtn) regenerateBtn.addEventListener('click', () => regenerateResponse(message));
    }

    elements.chatMessages.appendChild(messageElement);
    scrollToBottom();
    return messageElement;
}

function copyMessageContent(content) {
    navigator.clipboard.writeText(content).then(() => console.log('Content copied')).catch(err => console.error('Copy failed', err));
}

function editUserMessage(messageElement, message) {
    messageElement.classList.add('edit-mode');
    const contentElement = messageElement.querySelector('.message-content');
    const originalContent = message.content;

    contentElement.innerHTML = \`
        <div contenteditable="true" class="edit-content promptEditor">${originalContent.replace(/\n/g, '<br>')}</div>
        <div class="edit-actions">
            <button class="btn btn-sm btn-outline-secondary cancel-edit-btn">Cancel</button>
            <button class="btn btn-sm btn-primary save-edit-btn">Save & Regenerate</button>
        </div>
    \`;

    const editableArea = contentElement.querySelector('.edit-content');
    editableArea.focus();

    const cancelBtn = contentElement.querySelector('.cancel-edit-btn');
    const saveBtn = contentElement.querySelector('.save-edit-btn');

    cancelBtn.addEventListener('click', () => { messageElement.classList.remove('edit-mode'); contentElement.innerHTML = originalContent.replace(/\n/g, '<br>'); });

    saveBtn.addEventListener('click', () => {
        const editedContent = editableArea.innerText.trim();
        messageElement.classList.remove('edit-mode');
        contentElement.innerHTML = editedContent.replace(/\n/g, '<br>');

        // update message in state
        const currentChat = appState.chats[appState.currentChatId];
        const msgIndex = currentChat.messages.findIndex(m => m.timestamp === message.timestamp);
        if (msgIndex !== -1) {
            currentChat.messages[msgIndex].content = editedContent;
            currentChat.messages[msgIndex].timestamp = new Date().toISOString();
            // remove subsequent messages
            currentChat.messages = currentChat.messages.slice(0, msgIndex + 1);
            // remove subsequent message elements from UI
            const allMessageElements = Array.from(elements.chatMessages.querySelectorAll('.chat-bubble'));
            const currentIndex = allMessageElements.indexOf(messageElement);
            allMessageElements.slice(currentIndex + 1).forEach(el => el.remove());
            const waitingIndicator = addWaitingIndicator();
            callApi(waitingIndicator);
        }
    });
}

function regenerateResponse(afterMessage) {
    const currentChat = appState.chats[appState.currentChatId];
    const messageIndex = currentChat.messages.findIndex(msg => msg.timestamp === afterMessage.timestamp);
    if (messageIndex !== -1) {
        let lastUserMessageIndex = messageIndex - 1;
        while (lastUserMessageIndex >= 0 && currentChat.messages[lastUserMessageIndex].role !== 'user') lastUserMessageIndex--;
        if (lastUserMessageIndex >= 0) {
            currentChat.messages = currentChat.messages.slice(0, lastUserMessageIndex + 1);
            const allMessageElements = Array.from(elements.chatMessages.querySelectorAll('.chat-bubble'));
            for (let i = messageIndex; i < allMessageElements.length; i++) allMessageElements[i].remove();
            const waitingIndicator = addWaitingIndicator();
            callApi(waitingIndicator);
        }
    }
}

// API call — locked to single model and NO fallbacks
async function callApi(waitingIndicator) {
    try {
        if (appState.currentlyStreaming && appState.streamController) appState.streamController.abort();

        const messages = (appState.chats[appState.currentChatId].messages || []).map(msg => ({ role: msg.role, content: msg.content }));

        const requestPayload = {
            model: appState.selectedModel,
            messages: messages,
            stream: appState.settings.streaming
        };

        if (appState.settings.temperature !== 1.0) requestPayload.temperature = appState.settings.temperature;
        if (appState.settings.topP !== 1.0) requestPayload.top_p = appState.settings.topP;
        if (appState.settings.topK !== 0) requestPayload.top_k = appState.settings.topK;
        if (appState.settings.frequencyPenalty !== 0.0) requestPayload.frequency_penalty = appState.settings.frequencyPenalty;
        if (appState.settings.presencePenalty !== 0.0) requestPayload.presence_penalty = appState.settings.presencePenalty;
        if (appState.settings.repetitionPenalty !== 1.0) requestPayload.repetition_penalty = appState.settings.repetitionPenalty;
        if (appState.settings.minP !== 0.0) requestPayload.min_p = appState.settings.minP;
        if (appState.settings.topA !== 0.0) requestPayload.top_a = appState.settings.topA;
        if (appState.settings.seed !== null) requestPayload.seed = appState.settings.seed;
        if (appState.settings.maxTokens !== null) requestPayload.max_tokens = appState.settings.maxTokens;
        if (appState.settings.logprobs) requestPayload.logprobs = true;
        if (appState.settings.topLogprobs !== null) requestPayload.top_logprobs = appState.settings.topLogprobs;

        if (appState.settings.reasoning.effort || appState.settings.reasoning.maxTokens || appState.settings.reasoning.exclude) {
            requestPayload.reasoning = {};
            if (appState.settings.reasoning.effort) requestPayload.reasoning.effort = appState.settings.reasoning.effort;
            if (appState.settings.reasoning.maxTokens) requestPayload.reasoning.max_tokens = appState.settings.reasoning.maxTokens;
            if (appState.settings.reasoning.exclude) requestPayload.reasoning.exclude = true;
        }

        console.log("Sending API request with payload:", requestPayload);

        appState.streamController = new AbortController();
        const signal = appState.streamController.signal;
        const startTime = Date.now();

        // Ensure Authorization header uses stored API key (may be empty)
        const authHeader = appState.apiKey ? \`Bearer ${appState.apiKey}\` : '';

        if (appState.settings.streaming) {
            appState.currentlyStreaming = true;

            const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(requestPayload),
                signal: signal
            });

            if (!response.ok) {
                let errorData = {};
                try { errorData = await response.json(); } catch (e) { }
                throw new Error(errorData.error?.message || \`HTTP error: ${response.status}\`);
            }

            const assistantMessage = {
                role: 'assistant',
                content: '',
                model: appState.selectedModel,
                timestamp: new Date().toISOString(),
                processingTime: 0,
                usage: {}
            };

            waitingIndicator && waitingIndicator.parentNode && waitingIndicator.parentNode.removeChild(waitingIndicator);
            appState.chats[appState.currentChatId].messages.push(assistantMessage);
            const messageBubble = renderMessage(assistantMessage);
            const contentElement = messageBubble ? messageBubble.querySelector('.markdown-content') : null;

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    let lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine || trimmedLine === 'data: [DONE]' || trimmedLine.startsWith(':')) continue;
                        if (trimmedLine.startsWith('data: ')) {
                            const data = trimmedLine.slice(6);
                            try {
                                const parsedData = JSON.parse(data);
                                const contentDelta = parsedData.choices[0]?.delta?.content;
                                if (contentDelta) {
                                    assistantMessage.content += contentDelta;
                                    if (contentElement) {
                                        contentElement.innerHTML = marked.parse(assistantMessage.content);
                                        contentElement.querySelectorAll('pre code').forEach(block => { try { hljs.highlightElement(block); } catch (e) { } });
                                    }
                                    if (assistantMessage.content.length % 5 === 0) forceScrollToBottom();
                                }
                                if (parsedData.choices[0]?.finish_reason) assistantMessage.finish_reason = parsedData.choices[0].finish_reason;
                                if (parsedData.usage) {
                                    assistantMessage.usage = parsedData.usage;
                                    if (parsedData.usage) {
                                        assistantMessage.usage = parsedData.usage;
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing stream data:', e);
                            }
                        }
                    }
                }

                forceScrollToBottom();
            } catch (streamError) {
                if (streamError.name === 'AbortError') console.log('Stream cancelled'); else throw streamError;
            } finally {
                appState.currentlyStreaming = false;
            }

        } else {
            const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                let errorData = {};
                try { errorData = await response.json(); } catch (e) { }
                throw new Error(errorData.error?.message || \`HTTP error: ${response.status}\`);
            }

            const responseData = await response.json();
            const assistantMessage = {
                role: 'assistant',
                content: responseData.choices[0]?.message?.content || '',
                model: responseData.model || appState.selectedModel,
                timestamp: new Date().toISOString(),
                processingTime: (Date.now() - startTime) / 1000,
                usage: responseData.usage || {}
            };

            waitingIndicator && waitingIndicator.parentNode && waitingIndicator.parentNode.removeChild(waitingIndicator);
            appState.chats[appState.currentChatId].messages.push(assistantMessage);
            renderMessage(assistantMessage);
            forceScrollToBottom();
        }

        saveAppState();

    } catch (error) {
        console.error('API Error:', error);
        waitingIndicator && waitingIndicator.parentNode && waitingIndicator.parentNode.removeChild(waitingIndicator);

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = \`\n <div class="d-flex justify-content-between align-items-start">\n <div>\n <i class="fas fa-exclamation-circle me-2"></i>\n <strong>Error:</strong> \${error.message || 'Something went wrong'}\n </div>\n <button class="btn btn-sm btn-danger retry-btn">\n <i class="fas fa-redo-alt me-1"></i> Retry\n </button>\n </div>\n \`;
        elements.chatMessages && elements.chatMessages.appendChild(errorElement);

        const retryBtn = errorElement.querySelector('.retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', () => {
            errorElement.parentNode && errorElement.parentNode.removeChild(errorElement);
            const newWaitingIndicator = addWaitingIndicator();
            callApi(newWaitingIndicator);
        });

        forceScrollToBottom();
    }
}

function handlePromptKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function exportChat() {
    if (!appState.currentChatId) return;
    const currentChat = appState.chats[appState.currentChatId];
    const chatData = JSON.stringify(currentChat, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = \`chat_export_\${new Date().toISOString().replace(/:/g, '- ')}.json\`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

function handleImportChat(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedChat = JSON.parse(e.target.result);
            if (!importedChat.id || !importedChat.messages || !Array.isArray(importedChat.messages)) throw new Error('Invalid chat format');
            const newChatId = 'chat_' + Date.now();
            importedChat.id = newChatId;
            appState.chats[newChatId] = importedChat;
            saveAppState();
            loadChat(newChatId);
            const systemMessageElement = document.createElement('div');
            systemMessageElement.className = 'system-message';
            systemMessageElement.textContent = 'Chat imported successfully';
            elements.chatMessages && elements.chatMessages.appendChild(systemMessageElement);
        } catch (error) {
            console.error('Error importing chat:', error);
            alert('Error importing chat: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function deleteCurrentChat() {
    if (!appState.currentChatId || Object.keys(appState.chats).length <= 1) { createNewChat(); return; }
    delete appState.chats[appState.currentChatId];
    saveAppState();
    const chatIds = Object.keys(appState.chats);
    if (chatIds.length > 0) loadChat(chatIds[0]); else createNewChat();
}

function forceScrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 50);
    setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 150);
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage) lastMessage.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 300);
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleBeforeUnload(e) {
    if (Object.keys(appState.chats).length > 0) {
        e.preventDefault();
        try { leavePageModalInstance?.show(); } catch (err) { }
        e.returnValue = '';
    }
}

function placeCursorAtEnd(element) {
    if (!element) return;
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
}
    </script>
</body>


</html>
        `;
        body.appendChild(contentContainer);
        panel.appendChild(body);
        document.body.appendChild(panel);
        if (typeof draggable === 'function') {
            draggable(panel, header);
        } else {
            (function simpleDrag() {
                let dragging = false, ox = 0, oy = 0;
                const move = e => {
                    const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
                    const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
                    if (!dragging || x == null) return;
                    panel.style.left = (x - ox) + 'px';
                    panel.style.top = (y - oy) + 'px';
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
        }
        closeBtn.onclick = () => {
            panel.remove();
        };
        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = 2147483648;
        });
    }
    function draggable(panel, handle) {
        let dragging = false, ox = 0, oy = 0;
        const move = e => {
            const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
            const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
            if (!dragging || x == null) return;
            panel.style.left = (x - ox) + 'px';
            panel.style.top = (y - oy) + 'px';
            panel.style.right = '';
        };
        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
            if (handle) handle.style.cursor = 'grab';
        };
        handle.addEventListener('mousedown', e => {
            dragging = true;
            const r = panel.getBoundingClientRect();
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        });
        handle.addEventListener('touchstart', e => {
            dragging = true;
            const t = e.touches[0];
            const r = panel.getBoundingClientRect();
            ox = t.clientX - r.left;
            oy = t.clientY - r.top;
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', up);
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        });
    }
})();
