export default function detectDevice () {

    const node = document.documentElement;
    const ua = navigator.userAgent;
    const uaLowerCase = ua.toLowerCase();
    const appVersion = navigator.appVersion;

    // MobileDetect's detections are completely useless
    // https://stackoverflow.com/a/9851769
    // https://stackoverflow.com/a/24600597
    const isIE = !!document.documentMode;
    const isEdge = !!!document.documentMode && !!window.StyleMedia;
    const isChrome = !!window.chrome && !!window.chrome.webstore;
    const isFirefox = typeof InstallTrigger !== 'undefined';
    const isSafari = /constructor/i.test(window.HTMLElement) ||
        (function (p) {
            return p.toString() === "[object SafariRemoteNotification]";
        })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || ua.indexOf(' OPR/') >= 0;

    const isAndroid = /Android/i.test(appVersion) && !/trident/img.test(ua);
    const isIOS = /(iPhone|iPad|iPod).*AppleWebKit/i.test(appVersion);
    const isWindowsPhone = /(IEMobile|Windows Phone)/i.test(uaLowerCase);
    const versionAndroid = parseFloat(ua.substr(uaLowerCase.indexOf('android ') + 8, 3));
    const versionIOS = parseFloat(ua.substr(uaLowerCase.indexOf('os ') + 3, 3).replace('_', '.'));

    const isMobile = /Mobi/i.test(ua) || /Android/i.test(ua);
    const isDesktop = !isMobile;

    const isHD = window.devicePixelRatio >= 1.5;
    const isCompatibleDesktopBrowser = isDesktop && (isChrome || isSafari || isFirefox || isEdge);
    const isCrappy = isIE || isFirefox || (isIOS && versionIOS < 9) || (isAndroid && versionAndroid < 4.4);
    const isProbableTouch = isMobile || isAndroid || isIOS || isWindowsPhone || (!!window.ontouchstart || !!window.onmsgesturechange);
    const detection = {
        // Globals
        isMobile,
        isDesktop,
        // Desktop browsers
        isIE,
        isEdge,
        isChrome,
        isFirefox,
        isSafari,
        isOpera,
        // Mobile browsers
        isAndroid,
        isIOS,
        isWindowsPhone,
        // Others
        isHD,
        isCompatibleDesktopBrowser,
        isCrappy,
        isProbableTouch,
        isTouch: false // Will be modified if needed after the first 'touchstart' event (see below)
    };

    // Add relevant classes
    Object.keys(detection).map((key) => {
        const value = detection[key];
        const className = key.toLowerCase();
        if (value && !node.classList.contains(className)) {
            node.classList.add(className);
        }
    });

    // Detect if device is really a touch device
    // Unfortunately, this can only be guessed before actual user interaction
    // https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685
    window.addEventListener('touchstart', function onFirstTouch () {
        window.removeEventListener('touchstart', onFirstTouch, false);
        document.body.setAttribute('ontouchstart', ''); // Enable :active transitions on mobile devices
        node.classList.add('istouch');
        node.classList.remove('isprobabletouch');
    }, false);
}
