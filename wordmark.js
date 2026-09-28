// Makes the "Data Partners" (or "for Nonprofits" / "for Law Firms" / "for Advisors")
// line render at exactly the same width as "Trellis" above it, by nudging letter-spacing.
// Re-measures after web fonts finish loading, since Bricolage Grotesque's metrics
// aren't known until the real font is in.
(function () {
  function fitWordmarks() {
    document.querySelectorAll('.wordmark').forEach(function (wm) {
      var main = wm.querySelector('.main');
      var sub = wm.querySelector('.sub');
      if (!main || !sub) return;

      sub.style.letterSpacing = '';
      var mainWidth = main.getBoundingClientRect().width;
      var subWidth = sub.getBoundingClientRect().width;
      var chars = sub.textContent.length;
      var gaps = Math.max(chars - 1, 1);
      var currentLS = parseFloat(getComputedStyle(sub).letterSpacing) || 0;
      var delta = (mainWidth - subWidth) / gaps;

      sub.style.letterSpacing = (currentLS + delta) + 'px';
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitWordmarks);
  }
  window.addEventListener('load', fitWordmarks);
  fitWordmarks();
})();
