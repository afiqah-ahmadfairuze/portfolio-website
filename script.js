document.documentElement.classList.add('js');

// Detail pages share carousel code without requiring the homepage navigation.
if (document.querySelector('#navigation')) {
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobileLayout = window.matchMedia('(max-width: 1000px)');

function closeMenu(returnFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    navigation.classList.remove('is-open');
    if (returnFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
    }
});
document.addEventListener('click', (event) => {
    if (!event.target.closest('nav')) closeMenu();
});
navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (link && mobileLayout.matches) {
        closeMenu();
        document.querySelector(link.getAttribute('href'))?.focus({ preventScroll: true });
    }
});
mobileLayout.addEventListener('change', () => {
    const hiddenFocus = mobileLayout.matches && navigation.contains(document.activeElement);
    closeMenu(hiddenFocus);
});

// Track the visible content, including scrolling without changing the URL hash.
const sectionLinks = [...navigation.querySelectorAll('a[href]')];
const navigationSections = sectionLinks.map((link) => ({
    link,
    section: link.getAttribute('href') === '#home'
        ? document.querySelector('.hero')
        : document.querySelector(link.getAttribute('href')),
}));
let navigationFrame = null;
function updateCurrentNavigation() {
    navigationFrame = null;
    const readingLine = window.innerHeight * 0.28;
    let current = navigationSections[0];
    for (const entry of navigationSections) {
        if (entry.section && entry.section.getBoundingClientRect().top <= readingLine) {
            current = entry;
        }
    }
    // Keep the final section selected when it cannot scroll to the reading line.
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = navigationSections[navigationSections.length - 1];
    }
    for (const entry of navigationSections) {
        if (entry === current) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
    }
}
function scheduleNavigationUpdate() {
    if (navigationFrame === null) navigationFrame = window.requestAnimationFrame(updateCurrentNavigation);
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('hashchange', scheduleNavigationUpdate);
window.addEventListener('load', scheduleNavigationUpdate);
updateCurrentNavigation();
}

// One controller for independent project and award galleries; local images only.
document.querySelectorAll('[data-award-gallery], [data-carousel]').forEach((gallery) => {
    const slides = [...gallery.querySelectorAll('.award-slide')];
    if (slides.length < 2) return;
    const controls = gallery.querySelector('.award-controls');
    const dots = [...gallery.querySelectorAll('[data-slide]')];
    const pause = gallery.querySelector('[data-pause]');
    const announcement = gallery.querySelector('.award-announcement');
    const surface = gallery.querySelector('.award-slides');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer = null;
    let manuallyPaused = false;
    let hovered = gallery.matches(':hover');
    let focused = gallery.contains(document.activeElement);
    let touching = false;
    function intersectsViewport() {
        const bounds = gallery.getBoundingClientRect();
        return bounds.bottom > 0 && bounds.right > 0 && bounds.top < window.innerHeight && bounds.left < window.innerWidth;
    }
    let onscreen = intersectsViewport();
    let pointerStart = null;
    function show(next, announce = false) {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => { slide.hidden = i !== index; });
        dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
        if (announce) announcement.textContent = `Photo ${index + 1} of ${slides.length}`;
    }
    function updatePlayback() {
        if (timer !== null) window.clearTimeout(timer);
        timer = null;
        pause.disabled = reducedMotion.matches;
        pause.textContent = manuallyPaused ? 'Resume slideshow' : 'Pause slideshow';
        if (manuallyPaused || hovered || focused || touching || !onscreen || document.hidden || reducedMotion.matches) return;
        timer = window.setTimeout(() => {
            timer = null;
            show(index + 1);
            updatePlayback();
        }, 5000);
    }
    function navigate(next) { show(next, true); updatePlayback(); }
    gallery.querySelector('[data-previous]').addEventListener('click', () => navigate(index - 1));
    gallery.querySelector('[data-next]').addEventListener('click', () => navigate(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));
    pause.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updatePlayback(); });
    gallery.addEventListener('focusin', () => { focused = true; updatePlayback(); });
    gallery.addEventListener('focusout', (event) => {
        focused = gallery.contains(event.relatedTarget);
        updatePlayback();
    });
    gallery.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'touch') { hovered = true; updatePlayback(); }
    });
    gallery.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'touch') { hovered = false; updatePlayback(); }
    });
    gallery.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            navigate(index + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    surface.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'touch') return;
        touching = true;
        updatePlayback();
        pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });
    surface.addEventListener('pointerup', (event) => {
        if (!pointerStart || pointerStart.id !== event.pointerId) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        pointerStart = null;
        touching = false;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) navigate(index + (dx < 0 ? 1 : -1));
        else updatePlayback();
    });
    surface.addEventListener('pointercancel', () => { pointerStart = null; touching = false; updatePlayback(); });
    reducedMotion.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    if ('IntersectionObserver' in window) {
        const observer = new window.IntersectionObserver((entries) => {
            onscreen = entries[0].isIntersecting;
            updatePlayback();
        });
        observer.observe(gallery);
    } else {
        const updateVisibility = () => { onscreen = intersectsViewport(); updatePlayback(); };
        window.addEventListener('scroll', updateVisibility, { passive: true });
        window.addEventListener('resize', updateVisibility);
    }
    controls.hidden = false;
    updatePlayback();
});
