// CODE GENERATED USING mCompiler (v1.0) | Made by MubiLop
// Name: Toast Notifs
// ID: toastnotifs

(function (Scratch) {
    "use strict";

    const icon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjsgdGV4dC1yZW5kZXJpbmc6Z2VvbWV0cmljUHJlY2lzaW9uOyBpbWFnZS1yZW5kZXJpbmc6b3B0aW1pemVRdWFsaXR5OyBmaWxsLXJ1bGU6ZXZlbm9kZDsgY2xpcC1ydWxlOmV2ZW5vZGQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KPGc+PHBhdGggc3R5bGU9Im9wYWNpdHk6MC45ODciIGZpbGw9IiNmNzllNjAiIGQ9Ik0gMjI4LjUsLTAuNSBDIDIzMy4xNjcsLTAuNSAyMzcuODMzLC0wLjUgMjQyLjUsLTAuNUMgMjkyLjgzNSwxLjgzNjM4IDM0MC41MDEsMTQuNjY5NyAzODUuNSwzOEMgNDEzLjYxNSw1My4xMTUyIDQzNS40NDksNzQuNjE1MiA0NTEsMTAyLjVDIDQ1NC45NTMsMTEwLjA2NiA0NTcuNDUzLDExOC4wNjYgNDU4LjUsMTI2LjVDIDQ0OC4zOCwxMDEuMTU0IDQzMS4zOCw4MS42NTQxIDQwNy41LDY4QyAzNjcuNTYsNDUuMjYxMyAzMjQuNTYsMzIuNTk0NyAyNzguNSwzMEMgMjYzLjY2MSwyOS4xNzI0IDI0OC45OTQsMjkuMzM5MSAyMzQuNSwzMC41QyAxOTEuNDMsMzIuMjQ0NyAxNTAuNzYzLDQzLjA3OCAxMTIuNSw2M0MgOTQuMjgyLDczLjIxMDkgNzguNDQ4Niw4Ni4zNzc1IDY1LDEwMi41QyA0NS4yNDkyLDEzMS41OTUgNDUuOTE1OCwxNjAuMjYyIDY3LDE4OC41QyA3NS44MTM4LDE5OC43MzYgODUuNDgwNSwyMDguMDY5IDk2LDIxNi41QyA5Ny44NjA1LDIxOC44ODggOTkuMTkzOSwyMjEuNTU0IDEwMCwyMjQuNUMgMTAwLjUsMjkzLjQ5OSAxMDAuNjY3LDM2Mi40OTkgMTAwLjUsNDMxLjVDIDEwMC4wNjksNDQyLjU3OCAxMDAuNTY5LDQ1My41NzggMTAyLDQ2NC41QyAxMDUuMzU1LDQ3MS42ODcgMTEwLjUyMiw0NzcuMDIxIDExNy41LDQ4MC41QyA4OC42OTY0LDQ3My4zNjIgNzIuNjk2NCw0NTUuMDI5IDY5LjUsNDI1LjVDIDY5LjY2NjcsMzYxLjQ5OSA2OS41LDI5Ny40OTkgNjksMjMzLjVDIDQ5LjIyMDIsMjE3LjU5IDM0LjU1MzUsMTk3LjkyMyAyNSwxNzQuNUMgMTQuNDAzNywxMzYuODkgMjIuMDcwNCwxMDMuNTU3IDQ4LDc0LjVDIDc4Ljc4OTcsNDQuMDExNSAxMTUuMjksMjMuMTc4MSAxNTcuNSwxMkMgMTgwLjk3LDUuODY3NDggMjA0LjYzNiwxLjcwMDgyIDIyOC41LC0wLjUgWiIvPjwvZz48L3N2Zz4K";
    const assets = {};

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('"Toast Notifications" cannot run unsandboxed.');
    }

    const { BlockType, ArgumentType, Cast } = Scratch;

    function xmlEscape(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function validColour(colour) {
        if (typeof colour != "string") return false;
        return /^#[0-9A-F]{6}$/i.test(colour);
    }

    const toastConfig = { soundWhenEnabled: "true" };
    let notifClicked = false;
    let lastClickedNotif = { type: '', title: '', message: '' };

    const defaultStyles = {
        toast: {
            '--toast-bg': '#1a1a1a',
            '--toast-color': '#ffffff',
            '--toast-font-size': '16px',
            '--toast-border-radius': '16px',
            '--toast-padding': '15px',
            '--toast-duration': '3000',
            '--toast-min-width': '300px',
            '--toast-max-width': '400px',
            '--toast-shadow': '0 8px 16px rgba(0,0,0,0.2)',
            '--toast-z-index': 9999,
            '--toast-margin': '10px',
            'soundUrl': null
        },
        types: {
            origin:  { '--toast-type-bg': '#1a1a1a', '--toast-type-color': '#ffffff' },
            success: { '--toast-type-bg': '#4CAF50', '--toast-type-color': '#ffffff' },
            error:   { '--toast-type-bg': '#f44336', '--toast-type-color': '#ffffff' },
            warning: { '--toast-type-bg': '#ff9800', '--toast-type-color': '#000000' },
            info:    { '--toast-type-bg': '#2196F3', '--toast-type-color': '#ffffff' }
        }
    };

    let styleConfig = JSON.parse(JSON.stringify(defaultStyles));

    const createToastContainer = (position) => {
        let container = document.getElementById('ToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ToastContainer';
            container.dataset.toasts = '0';
            document.body.appendChild(container);
        }
        container.className = `toast-container ${position}`;
        return container;
    };

    const injectStyles = () => {
        if (document.getElementById('ToastStyles')) return;
        const style = document.createElement('style');
        style.id = 'ToastStyles';
        style.textContent = `
            :root { --toast-slide-duration: 0.3s; }
            .toast-container { position: fixed; z-index: 9999; padding: 20px; }
            .toast-container.top-left { top: 0; left: 0; }
            .toast-container.top-right { top: 0; right: 0; }
            .toast-container.top-center { top: 0; left: 50%; transform: translateX(-50%); }
            .toast-container.bottom-left { bottom: 0; left: 0; }
            .toast-container.bottom-right { bottom: 0; right: 0; }
            .toast-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); }
            .toast-container.center-left { top: 50%; left: 0; transform: translateY(-50%); }
            .toast-container.center-right { top: 50%; right: 0; transform: translateY(-50%); }
            .toast-container.center-center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .toast {
                display: flex;
                align-items: center;
                margin-bottom: var(--toast-margin);
                background-color: var(--toast-type-bg);
                color: var(--toast-type-color);
                font-size: var(--toast-font-size);
                border-radius: var(--toast-border-radius);
                padding: var(--toast-padding);
                min-width: var(--toast-min-width);
                max-width: var(--toast-max-width);
                box-shadow: var(--toast-shadow);
                opacity: 0;
                transform: translateY(100%);
                animation: toastSlideIn var(--toast-slide-duration) cubic-bezier(0.0,0.0,0.2,1) forwards;
                cursor: pointer;
                user-select: none;
            }
            .toast:hover { filter: brightness(1.1); }
            .toast img { width: 40px; height: 40px; margin-right: 15px; object-fit: cover; border-radius: calc(var(--toast-border-radius) / 2); }
            .toast-content { flex-grow: 1; }
            .toast-title { font-weight: bold; margin-bottom: 4px; }
            .toast-description { font-size: 0.9em; opacity: 0.8; }
            @keyframes toastSlideIn {
                from { opacity: 0; transform: translateY(100%); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes toastSlideOut {
                from { opacity: 1; transform: translateY(0); }
                to   { opacity: 0; transform: translateY(100%); }
            }
        `;
        document.head.appendChild(style);
    };

    class ToastNotifications {
        constructor() { injectStyles(); }

        getInfo() {
            return {
                id: 'toastnotifs',
                name: 'Toast Notifs',
                color1: "#905c1b",
                menuIconURI: icon,
                blocks: [
                    {
                        opcode: 'showToastNew',
                        blockType: BlockType.COMMAND,
                        text: 'show [TYPE] toast with title [TITLE] message [MESSAGE] at [POSITION]',
                        arguments: {
                            TYPE:     { type: ArgumentType.STRING, menu: 'types',     defaultValue: 'origin' },
                            TITLE:    { type: ArgumentType.STRING,                    defaultValue: 'Hello!' },
                            MESSAGE:  { type: ArgumentType.STRING,                    defaultValue: 'This is a toast message' },
                            POSITION: { type: ArgumentType.STRING, menu: 'positions', defaultValue: 'bottom-right' }
                        }
                    },
                    {
                        opcode: 'showImageToast',
                        blockType: BlockType.COMMAND,
                        text: 'show [TYPE] toast with image [IMAGE] title [TITLE] message [MESSAGE] at [POSITION]',
                        arguments: {
                            TYPE:     { type: ArgumentType.STRING, menu: 'types',     defaultValue: 'origin' },
                            IMAGE:    { type: ArgumentType.STRING,                    defaultValue: 'https://scratch.mit.edu/favicon.ico' },
                            TITLE:    { type: ArgumentType.STRING,                    defaultValue: 'Image Toast' },
                            MESSAGE:  { type: ArgumentType.STRING,                    defaultValue: 'This is a toast with an image!' },
                            POSITION: { type: ArgumentType.STRING, menu: 'positions', defaultValue: 'bottom-right' }
                        }
                    },
                    // ── NEW: dedicated sound block ──────────────────────────────
                    {
                        opcode: 'setNotifSound',
                        blockType: BlockType.COMMAND,
                        text: 'set notification sound to URL [URL]',
                        arguments: {
                            URL: {
                                type: ArgumentType.STRING,
                                defaultValue: 'https://raw.githubusercontent.com/ayaanramin/RovaApp/main/notif.wav'
                            }
                        }
                    },
                    {
                        opcode: 'setSoundEnabled',
                        blockType: BlockType.COMMAND,
                        text: 'set notification sounds [ENABLED]',
                        arguments: {
                            ENABLED: { type: ArgumentType.STRING, menu: 'enabledMenu' }
                        }
                    },
                    {
                        opcode: 'whenNotifClicked',
                        blockType: BlockType.HAT,
                        text: 'when a notification is clicked',
                        isEdgeActivated: false,
                    },
                    {
                        opcode: 'notifWasClicked',
                        blockType: BlockType.BOOLEAN,
                        text: 'notification was clicked?',
                    },
                    {
                        opcode: 'resetNotifClicked',
                        blockType: BlockType.COMMAND,
                        text: 'reset notification clicked',
                    },
                    {
                        opcode: 'lastClickedType',
                        blockType: BlockType.REPORTER,
                        text: 'type of last clicked notification',
                    },
                    {
                        opcode: 'lastClickedTitle',
                        blockType: BlockType.REPORTER,
                        text: 'title of last clicked notification',
                    },
                    {
                        opcode: 'lastClickedMessage',
                        blockType: BlockType.REPORTER,
                        text: 'message of last clicked notification',
                    },
                    {
                        opcode: 'whenNotifTypeClicked',
                        blockType: BlockType.HAT,
                        isEdgeActivated: false,
                        text: 'when a [TYPE] notification is clicked',
                        arguments: {
                            TYPE: { type: ArgumentType.STRING, menu: 'types', defaultValue: 'info' }
                        }
                    },
                    {
                        opcode: 'clearAllNotifs',
                        blockType: BlockType.COMMAND,
                        text: 'clear all notifications',
                    },
                    {
                        opcode: 'setCustomStyle',
                        blockType: BlockType.COMMAND,
                        text: 'set toast style [STYLE] to [VALUE]',
                        arguments: {
                            STYLE: { type: ArgumentType.STRING, menu: 'styleProperties' },
                            VALUE: { type: ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'setTypeStyle',
                        blockType: BlockType.COMMAND,
                        text: 'set [TYPE] toast background to [BG] and text color to [COLOR]',
                        arguments: {
                            TYPE:  { type: ArgumentType.STRING, menu: 'types' },
                            BG:    { type: ArgumentType.COLOR },
                            COLOR: { type: ArgumentType.COLOR }
                        }
                    },
                    {
                        opcode: 'resetStyles',
                        blockType: BlockType.COMMAND,
                        text: 'reset all styles to default'
                    },
                    {
                        opcode: 'showCustomNotification',
                        blockType: BlockType.COMMAND,
                        text: 'show notification [TYPE] with title [TITLE] message [MESSAGE] at [POSITION] with custom css [CSS]',
                        hideFromPalette: true,
                        arguments: {
                            TYPE:     { type: ArgumentType.STRING, menu: 'types' },
                            TITLE:    { type: ArgumentType.STRING, defaultValue: 'Title' },
                            MESSAGE:  { type: ArgumentType.STRING, defaultValue: 'Message' },
                            POSITION: { type: ArgumentType.STRING, menu: 'positions' },
                            CSS:      { type: ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'showToast',
                        blockType: BlockType.COMMAND,
                        text: 'Show Toast with text [TEXT] with image [IMAGE] image rounded? [ROUNDED]',
                        hideFromPalette: true,
                        arguments: {
                            TEXT:    { type: ArgumentType.STRING, defaultValue: 'Toast!' },
                            IMAGE:   { type: ArgumentType.STRING, defaultValue: 'https://scratch.mit.edu/favicon.ico' },
                            ROUNDED: { type: ArgumentType.STRING, menu: 'yesorno', defaultValue: 'no' }
                        }
                    },
                    {
                        opcode: 'showNotificationToast',
                        blockType: BlockType.COMMAND,
                        text: 'Show Notification Toast with text [TEXT] at position [POSITION] custom css? [STYLES]',
                        hideFromPalette: true,
                        arguments: {
                            TEXT:     { type: ArgumentType.STRING, defaultValue: 'Hello, World!' },
                            POSITION: { type: ArgumentType.STRING, menu: 'position', defaultValue: 'up' },
                            STYLES:   { type: ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'showAlert',
                        blockType: BlockType.COMMAND,
                        text: 'Show Alert with text [TEXT] with duration of [DURATION] seconds',
                        hideFromPalette: true,
                        arguments: {
                            TEXT:     { type: ArgumentType.STRING, defaultValue: 'Hello!' },
                            DURATION: { type: ArgumentType.STRING, defaultValue: '5' }
                        }
                    },
                    {
                        opcode: "setConfig",
                        text: "Set config [CONFIG] to [VALUE]",
                        blockType: BlockType.COMMAND,
                        hideFromPalette: true,
                        arguments: {
                            CONFIG: { type: ArgumentType.STRING, defaultValue: "soundWhenAlertEnabled", menu: "configs" },
                            VALUE:  { type: ArgumentType.STRING, defaultValue: "true" }
                        }
                    }
                ],
                menus: {
                    configs: [{ text: "play sound when alert", value: "soundWhenAlertEnabled" }],
                    positions: {
                        acceptReporters: true,
                        items: ['top-left','top-center','top-right','center-left','center-center','center-right','bottom-left','bottom-center','bottom-right']
                    },
                    types: { acceptReporters: true, items: ['origin','success','error','warning','info'] },
                    styleProperties: {
                        acceptReporters: false,
                        items: [
                            { text: 'background color',  value: '--toast-bg' },
                            { text: 'text color',        value: '--toast-color' },
                            { text: 'font size',         value: '--toast-font-size' },
                            { text: 'border radius',     value: '--toast-border-radius' },
                            { text: 'padding',           value: '--toast-padding' },
                            { text: 'shadow',            value: '--toast-shadow' },
                            { text: 'duration (ms)',     value: '--toast-duration' },
                            { text: 'minimum width',     value: '--toast-min-width' },
                            { text: 'maximum width',     value: '--toast-max-width' },
                            { text: 'z-index (deprecated)', value: '--toast-z-index' },
                            { text: 'margin',            value: '--toast-margin' },
                            { text: 'sound URL',         value: 'soundUrl' }
                        ]
                    },
                    enabledMenu: ['true', 'false'],
                    position: ['up', 'middle', 'down'],
                    yesorno: ['yes', 'no']
                }
            };
        }

        // ── NEW: dedicated sound block ──────────────────────────────────────
        setNotifSound(args) {
            styleConfig.toast.soundUrl = Cast.toString(args.URL);
        }

        setCustomStyle(args) {
            const style = Cast.toString(args.STYLE);
            const value = Cast.toString(args.VALUE);
            if (style === 'soundUrl') {
                styleConfig.toast[style] = value;
            } else {
                styleConfig.toast[style] = value.includes('px') ? value : `${value}px`;
            }
        }

        setTypeStyle(args) {
            const type = Cast.toString(args.TYPE);
            const bg   = Cast.toString(args.BG);
            const color = Cast.toString(args.COLOR);
            if (styleConfig.types[type]) {
                styleConfig.types[type]['--toast-type-bg']    = validColour(bg)    ? bg    : defaultStyles.types[type]['--toast-type-bg'];
                styleConfig.types[type]['--toast-type-color'] = validColour(color) ? color : defaultStyles.types[type]['--toast-type-color'];
            }
        }

        resetStyles() {
            styleConfig = JSON.parse(JSON.stringify(defaultStyles));
        }

        showToastNew(args) {
            this._createToast({
                type:     'origin',
                text:     xmlEscape(Cast.toString(args.TITLE)),
                message:  xmlEscape(Cast.toString(args.MESSAGE)),
                position: xmlEscape(Cast.toString(args.POSITION))
            });
        }

        showToast(args) {
            this._createToast({
                type:         'origin',
                text:         xmlEscape(Cast.toString(args.TEXT)),
                image:        xmlEscape(Cast.toString(args.IMAGE)),
                imageRounded: Cast.toString(args.ROUNDED) === 'yes',
                position:     'bottom-right'
            });
        }

        showImageToast(args) {
            this._createToast({
                type:     Cast.toString(args.TYPE),
                image:    xmlEscape(Cast.toString(args.IMAGE)),
                title:    xmlEscape(Cast.toString(args.TITLE)),
                text:     xmlEscape(Cast.toString(args.MESSAGE)),
                position: Cast.toString(args.POSITION)
            });
        }

        setSoundEnabled({ ENABLED }) {
            toastConfig.soundWhenEnabled = Cast.toString(ENABLED);
        }

        showCustomNotification(args) {
            this._createToast({
                type:      Cast.toString(args.TYPE),
                title:     xmlEscape(Cast.toString(args.TITLE)),
                text:      xmlEscape(Cast.toString(args.MESSAGE)),
                position:  Cast.toString(args.POSITION),
                customCss: Cast.toString(args.CSS)
            });
        }

        showAlert(args) {
            this._createToast({
                type:     'origin',
                text:     xmlEscape(Cast.toString(args.TEXT)),
                position: 'center-center',
                duration: Cast.toNumber(args.DURATION) * 1000
            });
        }

        showNotificationToast(args) {
            const pos = { up: 'top-right', middle: 'center-right', down: 'bottom-right' }[Cast.toString(args.POSITION)] || 'bottom-right';
            this._createToast({
                type:      'origin',
                text:      xmlEscape(Cast.toString(args.TEXT)),
                position:  pos,
                customCss: Cast.toString(args.STYLES)
            });
        }

        setConfig(args) {
            toastConfig[Cast.toString(args.CONFIG)] = Cast.toString(args.VALUE);
        }

        whenNotifClicked() {
            if (notifClicked) {
                notifClicked = false;
                return true;
            }
            return false;
        }

        notifWasClicked() {
            return notifClicked;
        }

        resetNotifClicked() {
            notifClicked = false;
        }

        lastClickedType() {
            return lastClickedNotif.type;
        }

        lastClickedTitle() {
            return lastClickedNotif.title;
        }

        lastClickedMessage() {
            return lastClickedNotif.message;
        }

        whenNotifTypeClicked(args) {
            if (notifClicked && lastClickedNotif.type === Cast.toString(args.TYPE)) {
                notifClicked = false;
                return true;
            }
            return false;
        }

                clearAllNotifs() {
            const container = document.getElementById('ToastContainer');
            if (!container) return;
            const toasts = container.querySelectorAll('.toast');
            toasts.forEach(toast => {
                toast.style.animation = 'toastSlideOut var(--toast-slide-duration) cubic-bezier(0.4,0.0,1,1) forwards';
                setTimeout(() => toast.remove(), 300);
            });
            setTimeout(() => { container.dataset.toasts = '0'; }, 350);
        }

                _dismissToast(toast, container, stackSize) {
            // Guard: already dismissing
            if (toast.dataset.dismissing) return;
            toast.dataset.dismissing = '1';
            toast.style.animation = 'toastSlideOut var(--toast-slide-duration) cubic-bezier(0.4,0.0,1,1) forwards';
            setTimeout(() => {
                toast.remove();
                container.dataset.toasts = Math.max(0, parseInt(container.dataset.toasts || '1') - 1);
            }, 300);
        }

        _createToast(options) {
            const container = createToastContainer(options.position);
            const toast = document.createElement('div');
            toast.className = 'toast';

            const zIndex = styleConfig.toast['--toast-z-index'] || 9999;
            toast.style.zIndex = zIndex;

            const stackSize = parseInt(container.dataset.toasts || '0');
            container.dataset.toasts = stackSize + 1;

            const typeStyle = styleConfig.types[options.type] || styleConfig.types.origin;
            Object.entries(typeStyle).forEach(([prop, value]) => toast.style.setProperty(prop, value));
            Object.entries(styleConfig.toast).forEach(([prop, value]) => {
                if (prop !== 'soundUrl') toast.style.setProperty(prop, value);
            });

            toast.style.transform = `translateY(${stackSize * 100}%)`;
            toast.style.transition = 'transform 0.3s ease-out';

            // ── CLICK TO DISMISS ────────────────────────────────────────────
            // Store identifying info on the element so the click handler can read it
            toast.dataset.notifType    = options.type    || '';
            toast.dataset.notifTitle   = options.title   || options.text || '';
            toast.dataset.notifMessage = options.message || options.text || '';
            toast.addEventListener('click', () => {
                notifClicked = true;
                lastClickedNotif = {
                    type:    toast.dataset.notifType,
                    title:   toast.dataset.notifTitle,
                    message: toast.dataset.notifMessage,
                };
                this._dismissToast(toast, container, stackSize);
            });

            if (options.image) {
                const img = document.createElement('img');
                img.src = options.image;
                img.alt = 'Toast icon';
                if (options.imageRounded) img.style.borderRadius = '50%';
                toast.appendChild(img);
            }

            const content = document.createElement('div');
            content.className = 'toast-content';

            if (options.title) {
                const title = document.createElement('div');
                title.className = 'toast-title';
                title.textContent = options.title;
                content.appendChild(title);
            }

            const message = document.createElement('div');
            message.className = options.title ? 'toast-description' : 'toast-content';
            message.textContent = options.text;
            content.appendChild(message);

            toast.appendChild(content);
            container.appendChild(toast);

            // ── SOUND ───────────────────────────────────────────────────────
            if (toastConfig.soundWhenEnabled === "true" && styleConfig.toast.soundUrl) {
                const audio = new Audio(styleConfig.toast.soundUrl);
                audio.play().catch(() => {});
            }

            // ── AUTO DISMISS ────────────────────────────────────────────────
            const duration = options.duration || parseInt(styleConfig.toast['--toast-duration']) || 3000;
            setTimeout(() => {
                this._dismissToast(toast, container, stackSize);
            }, duration);
        }
    }

    Scratch.extensions.register(new ToastNotifications());
})(Scratch);
