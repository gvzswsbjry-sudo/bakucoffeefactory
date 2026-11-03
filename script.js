const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

const homeNavLink = mainNav?.querySelector('a[href="index.html"]');
const menuNavLink = mainNav?.querySelector('a[href="menyu.html"]');
if (homeNavLink && menuNavLink) homeNavLink.after(menuNavLink);

mainNav?.querySelectorAll('a[href*="#haqqimizda"]').forEach((link) => link.remove());

const navigationStyles = document.createElement('link');
navigationStyles.rel = 'stylesheet';
navigationStyles.href = 'navigation.css';
document.head.append(navigationStyles);

const brandStyles = document.createElement('link');
brandStyles.rel = 'stylesheet';
brandStyles.href = 'brand.css';
document.head.append(brandStyles);
document.querySelectorAll('.site-header .brand').forEach((brand) => {
  brand.setAttribute('aria-label', 'Baku Coffee Factory ana səhifə');
  const logo = document.createElement('img');
  logo.alt = 'Baku Coffee Factory';
  logo.addEventListener('load', () => {
    if (logo.naturalWidth > 0) brand.replaceChildren(logo);
  }, { once: true });
  const logoUrl = new URL('assets/brand/baku-coffee-factory-logo.jpg', document.baseURI);
  logoUrl.searchParams.set('v', '20261101');
  logo.src = logoUrl.href;
  if (logo.complete && logo.naturalWidth > 0) brand.replaceChildren(logo);
});

const accountStyles = document.createElement('link');
accountStyles.rel = 'stylesheet';
accountStyles.href = 'account.css?v=20261103-v3';
document.head.append(accountStyles);
const accountScript = document.createElement('script');
accountScript.src = 'account.js?v=20261103-v3';
accountScript.async = false;
document.body.append(accountScript);

const favoritesStyles = document.createElement('link');
favoritesStyles.rel = 'stylesheet';
favoritesStyles.href = 'favorites.css';
document.head.append(favoritesStyles);
const favoritesScript = document.createElement('script');
favoritesScript.src = 'favorites.js';
favoritesScript.async = false;
document.body.append(favoritesScript);

const analyticsScript = document.createElement('script');
analyticsScript.src = 'analytics.js?v=20261103-v1';
analyticsScript.async = true;
document.body.append(analyticsScript);

menuToggle?.addEventListener('click', () => {
  const menuIsOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(menuIsOpen));
  menuToggle.setAttribute('aria-label', menuIsOpen ? 'Menyunu bağla' : 'Menyunu aç');
});

mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const menuIntroHeading = document.querySelector('.menu-top h1');
document.querySelectorAll('.menu-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.menu-tab').forEach((item) => {
    const selected = item.dataset.menuTarget === tab.dataset.menuTarget;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  document.querySelectorAll('.menu-panel').forEach((panel) => panel.classList.remove('active'));
  document.getElementById(tab.dataset.menuTarget)?.classList.add('active');
  if (menuIntroHeading) menuIntroHeading.innerHTML = tab.dataset.menuTarget === 'dessertMenu'
    ? 'Şirin bir<br /><em>fasilə.</em>'
    : 'Bir fincan<br /><em>seçin.</em>';
}));

if (!document.querySelector('link[href^="catalog.css"]')) {
  const catalogStyles = document.createElement('link');
  catalogStyles.rel = 'stylesheet';
  catalogStyles.href = 'catalog.css?v=20261023-coffee-details';
  document.head.append(catalogStyles);
}

const mainMenuPanel = document.getElementById('mainMenu');
const dessertMenuPanel = document.getElementById('dessertMenu');

if (mainMenuPanel || dessertMenuPanel) {
  const menuBackgroundStyles = document.createElement('link');
  menuBackgroundStyles.rel = 'stylesheet';
  menuBackgroundStyles.href = 'menu-background.css';
  document.head.append(menuBackgroundStyles);
}

if (mainMenuPanel && !mainMenuPanel.querySelector('.menu-atmosphere')) {
  const atmosphere = document.createElement('div');
  atmosphere.className = 'menu-atmosphere';
  atmosphere.setAttribute('aria-hidden', 'true');
  atmosphere.innerHTML = `
    <img src="assets/menu-background/v60.jpg" alt="" />
    <img src="assets/menu-background/chemex.jpg" alt="" />
    <img src="assets/menu-background/cold-brew.jpg" alt="" />
    <img src="assets/menu-background/grinder.jpg" alt="" />
    <img src="assets/menu-background/french-press.jpg" alt="" />`;
  mainMenuPanel.prepend(atmosphere);
}

if (dessertMenuPanel && !dessertMenuPanel.querySelector('.menu-atmosphere')) {
  const dessertAtmosphere = document.createElement('div');
  dessertAtmosphere.className = 'menu-atmosphere';
  dessertAtmosphere.setAttribute('aria-hidden', 'true');
  dessertAtmosphere.innerHTML = `
    <img src="assets/dessert-background/cheesecake.jpg" alt="" />
    <img src="assets/dessert-background/tiramisu.jpg" alt="" />
    <img src="assets/dessert-background/cake.jpg" alt="" />
    <img src="assets/dessert-background/brownie.jpg" alt="" />
    <img src="assets/dessert-background/crepe.jpg" alt="" />`;
  dessertMenuPanel.prepend(dessertAtmosphere);
}

// Disable double-tap-to-zoom and multi-touch zoom (especially in modals & iOS Safari)
if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window.__bcfZoomPreventionInit) {
  window.__bcfZoomPreventionInit = true;

  let lastTouchEnd = 0;
  let lastTouchX = 0;
  let lastTouchY = 0;

  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      const touch = event.changedTouches && event.changedTouches[0];
      const x = touch ? touch.clientX : 0;
      const y = touch ? touch.clientY : 0;
      const timeDiff = now - lastTouchEnd;
      const dist = Math.hypot(x - lastTouchX, y - lastTouchY);

      if (timeDiff <= 350 && dist < 48) {
        event.preventDefault();
        const button = event.target.closest('button, [role="button"], a, input[type="submit"], input[type="button"]');
        if (button && !button.disabled) {
          button.click();
        } else if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          event.target.focus();
        }
      }

      lastTouchEnd = now;
      lastTouchX = x;
      lastTouchY = y;
    },
    { passive: false, capture: true }
  );

  document.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false, capture: true }
  );

  ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
    document.addEventListener(
      type,
      (event) => {
        event.preventDefault();
      },
      { passive: false, capture: true }
    );
  });

  document.addEventListener(
    'dblclick',
    (event) => {
      event.preventDefault();
    },
    { passive: false, capture: true }
  );
}

