/* Article page: reading progress, contents highlight, theme, share */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle (shares the setting with the main site)
  const meta = document.querySelector('meta[name="theme-color"]');
  const syncMeta = () => meta && meta.setAttribute('content', root.dataset.theme === 'dark' ? '#0E1D33' : '#F6F4EF');
  syncMeta();
  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    syncMeta();
  });

  // Reading progress (measured across the article body)
  const bar = $('.scroll-progress');
  const body = $('.post__body');
  let ticking = false;
  const update = () => {
    const r = body.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
    bar.style.transform = `scaleX(${p})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Highlight the current section in the contents list
  const links = $$('.post__toc a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  $$('.post__body h2[id]').forEach((h) => spy.observe(h));

  // Share on LinkedIn — uses the page's live address once the site is online
  const share = $('#shareLinkedIn');
  if (share && location.protocol.startsWith('http')) {
    share.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href.split('#')[0])}`;
  }

  // Copy link + toast
  const toast = $('#toast');
  let timer;
  $('#copyLink')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      toast.textContent = 'Link copied';
    } catch (e) {
      toast.textContent = 'Copy the address from your browser bar';
    }
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  });
})();
