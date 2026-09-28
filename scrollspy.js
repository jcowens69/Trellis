// Underlines the nav link for whichever section is currently in view,
// the same style as :hover, so the nav reflects scroll position.
// Plain scroll-position math rather than IntersectionObserver, so it
// doesn't depend on compositor-driven callbacks.
(function () {
  const navMenu = document.getElementById('navMenu');
  if (!navMenu) return;

  const links = Array.from(navMenu.querySelectorAll(':scope > li > a[href^="#"]'));
  if (!links.length) return;

  const entries = links
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(e => e.section);

  if (!entries.length) return;

  let ticking = false;

  function update() {
    ticking = false;
    const line = window.innerHeight * 0.35;
    let current = null;
    for (const e of entries) {
      const rect = e.section.getBoundingClientRect();
      if (rect.top <= line) current = e.link;
    }
    links.forEach(l => l.classList.toggle('active', l === current));
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
