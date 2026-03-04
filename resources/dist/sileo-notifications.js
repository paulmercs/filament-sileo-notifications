const SILEO_MOUNT_ID = 'sileo-toaster-root';
const SILEO_LISTENER_FLAG = '__sileoNotificationListenerRegistered';
const SILEO_DOM_BRIDGE_FLAG = '__sileoDomBridgeRegistered';
const SILEO_CSS_ID = 'sileo-cdn-css';
const SILEO_READY_FLAG = '__sileoReady';
const SILEO_PLUGIN_CONFIG = window.filamentSileoNotificationsConfig ?? {};
const DEFAULT_CREATE_TITLES = ['created', 'record created successfully'];
const DEFAULT_EDIT_TITLES = ['saved', 'changes saved successfully'];
const DEFAULT_DELETE_TITLES = ['deleted', 'record deleted successfully'];

if (! document.getElementById(SILEO_CSS_ID)) {
    const cssLink = document.createElement('link');
    cssLink.id = SILEO_CSS_ID;
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://esm.sh/sileo@0.1.5/styles.css';
    document.head.appendChild(cssLink);
}

const getFilamentStatusFromElement = (element) => {
    if (element.classList.contains('fi-status-danger')) {
        return 'danger';
    }

    if (element.classList.contains('fi-status-success')) {
        return 'success';
    }

    if (element.classList.contains('fi-status-warning')) {
        return 'warning';
    }

    if (element.classList.contains('fi-status-info')) {
        return 'info';
    }

    return 'info';
};

const inferNotificationOperation = (title) => {
    const normalizedTitle = (title ?? '').toString().trim().toLowerCase();

    if (normalizedTitle === (SILEO_PLUGIN_CONFIG?.create?.title ?? '').toLowerCase()) {
        return 'create';
    }

    if (normalizedTitle === (SILEO_PLUGIN_CONFIG?.edit?.title ?? '').toLowerCase()) {
        return 'edit';
    }

    if (normalizedTitle === (SILEO_PLUGIN_CONFIG?.delete?.title ?? '').toLowerCase()) {
        return 'delete';
    }

    if (DEFAULT_CREATE_TITLES.includes(normalizedTitle)) {
        return 'create';
    }

    if (DEFAULT_EDIT_TITLES.includes(normalizedTitle)) {
        return 'edit';
    }

    if (DEFAULT_DELETE_TITLES.includes(normalizedTitle)) {
        return 'delete';
    }

    return null;
};

const processFilamentNotificationElement = (element, sendToast) => {
    if (! element || element.dataset.sileoProcessed === '1') {
        return;
    }

    element.dataset.sileoProcessed = '1';

    let title = element.querySelector('.fi-no-notification-title')?.textContent?.trim() ?? 'Notification';
    let body = element.querySelector('.fi-no-notification-body')?.textContent?.trim() ?? '';
    const status = getFilamentStatusFromElement(element);
    const operation = inferNotificationOperation(title);

    if (status === 'success' && operation === 'create') {
        title = SILEO_PLUGIN_CONFIG?.create?.title ?? title;
        body = SILEO_PLUGIN_CONFIG?.create?.body ?? body;
    } else if (status === 'success' && operation === 'edit') {
        title = SILEO_PLUGIN_CONFIG?.edit?.title ?? title;
        body = SILEO_PLUGIN_CONFIG?.edit?.body ?? body;
    } else if (status === 'success' && operation === 'delete') {
        title = SILEO_PLUGIN_CONFIG?.delete?.title ?? title;
        body = SILEO_PLUGIN_CONFIG?.delete?.body ?? body;
    }

    try {
        sendToast({
            title,
            description: body,
            status,
        });

        element.style.display = 'none';
        element.remove();
    } catch (error) {
        console.error('Filament Sileo notifications bridge failed:', error);
    }
};

const bootBridge = (sendToast) => {
    const processExistingFilamentNotifications = () => {
        document.querySelectorAll('.fi-no-notification').forEach((element) => {
            processFilamentNotificationElement(element, sendToast);
        });
    };

    processExistingFilamentNotifications();

    if (! window[SILEO_DOM_BRIDGE_FLAG]) {
        window[SILEO_DOM_BRIDGE_FLAG] = true;

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (! (node instanceof HTMLElement)) {
                        continue;
                    }

                    if (node.matches('.fi-no-notification')) {
                        processFilamentNotificationElement(node, sendToast);
                        continue;
                    }

                    node.querySelectorAll?.('.fi-no-notification').forEach((element) => {
                        processFilamentNotificationElement(element, sendToast);
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    if (! window[SILEO_LISTENER_FLAG]) {
        window[SILEO_LISTENER_FLAG] = true;

        window.addEventListener('notificationSent', (event) => {
            const detail = event?.detail?.notification ?? {};
            let title = detail.title;
            let body = detail.body;
            const operation = inferNotificationOperation(detail.title);

            if (detail.status === 'success' && operation === 'create') {
                title = SILEO_PLUGIN_CONFIG?.create?.title ?? title;
                body = SILEO_PLUGIN_CONFIG?.create?.body ?? body;
            } else if (detail.status === 'success' && operation === 'edit') {
                title = SILEO_PLUGIN_CONFIG?.edit?.title ?? title;
                body = SILEO_PLUGIN_CONFIG?.edit?.body ?? body;
            } else if (detail.status === 'success' && operation === 'delete') {
                title = SILEO_PLUGIN_CONFIG?.delete?.title ?? title;
                body = SILEO_PLUGIN_CONFIG?.delete?.body ?? body;
            }

            sendToast({
                title,
                description: body,
                status: detail.status,
                duration: detail.duration,
            });
        });
    }
};

const startSileo = async () => {
    try {
        const ReactModule = await import('https://esm.sh/react@18.3.1?bundle');
        const ReactDomClientModule = await import('https://esm.sh/react-dom@18.3.1/client?bundle&deps=react@18.3.1');
        const SileoModule = await import('https://esm.sh/sileo@0.1.5?bundle&deps=react@18.3.1,react-dom@18.3.1');

        const React = ReactModule.default ?? ReactModule;
        const createRoot = ReactDomClientModule.createRoot;
        const Toaster = SileoModule.Toaster;
        const sileo = SileoModule.sileo;

        if (! document.getElementById(SILEO_MOUNT_ID)) {
            const mountNode = document.createElement('div');
            mountNode.id = SILEO_MOUNT_ID;
            document.body.appendChild(mountNode);

            const root = createRoot(mountNode);

            root.render(
                React.createElement(Toaster, {
                    position: 'top-right',
                    theme: 'system',
                }),
            );
        }

        const sendToast = (payload = {}) => {
            const title = payload.title ?? 'Notification';
            const description = payload.description ?? payload.body ?? '';
            const status = payload.status ?? 'info';
            const duration = payload.duration === 'persistent'
                ? null
                : (typeof payload.duration === 'number' ? payload.duration : undefined);

            const toastPayload = {
                title,
                description,
                duration,
            };

            if (status === 'danger' || status === 'error') {
                sileo.error(toastPayload);

                return;
            }

            if (status === 'success') {
                sileo.success(toastPayload);

                return;
            }

            if (status === 'warning') {
                sileo.warning(toastPayload);

                return;
            }

            sileo.info(toastPayload);
        };

        window[SILEO_READY_FLAG] = true;
        bootBridge(sendToast);
    } catch (error) {
        console.error('Unable to initialize Sileo notifications. Falling back to default Filament notifications.', error);
    }
};

startSileo();
