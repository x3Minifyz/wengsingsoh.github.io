/* =========================================================
   Soh Weng Sing — Portfolio interactions
   Vanilla JS, no libraries.
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle (light / dark navy) ---------- */
  const metaTheme = $('meta[name="theme-color"]');
  const syncMeta = () => metaTheme && metaTheme.setAttribute('content', root.dataset.theme === 'dark' ? '#0E1D33' : '#F6F4EF');
  syncMeta();
  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
    syncMeta();
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const toggleMenu = (force) => {
    const open = typeof force === 'boolean' ? force : !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger?.addEventListener('click', () => toggleMenu());
  $$('a', menu).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) toggleMenu(false);
  });
  window.matchMedia('(min-width: 821px)').addEventListener('change', (e) => e.matches && toggleMenu(false));

  /* ---------- Animated counters ---------- */
  const animateCount = (el) => {
    const from = parseFloat(el.dataset.from || '0');
    const to = parseFloat(el.dataset.to || '0');
    if (prefersReduced) { el.textContent = to; return; }
    const dur = parseInt(el.dataset.duration || '1600', 10);
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = clamp((now - start) / dur);
      el.textContent = Math.round(from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Build dot grids (20 entities) ---------- */
  $$('[data-dots]').forEach((wrap) => {
    const n = parseInt(wrap.dataset.dots, 10) || 0;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.style.setProperty('--i', i);
      wrap.appendChild(d);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      $$('.count', el).forEach(animateCount);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Active nav link (scroll spy) ---------- */
  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean).forEach((s) => spy.observe(s));

  /* ---------- Split text into words for scroll scrubbing ---------- */
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = part;
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    return $$('.w', el);
  };
  const scrubs = $$('[data-scrub]').map((el) => ({ el, words: splitWords(el), lit: -1 }));

  /* ---------- Timeline progress ---------- */
  const timeline = $('.timeline');
  const timelineFill = $('.timeline__fill');
  const jobs = $$('.job');
  const updateTimeline = (vh) => {
    if (!timeline) return;
    const r = timeline.getBoundingClientRect();
    const trigger = vh * 0.6;
    timelineFill.style.transform = `scaleY(${clamp((trigger - r.top) / r.height)})`;
    jobs.forEach((job) => {
      const marker = $('.job__marker', job).getBoundingClientRect();
      job.classList.toggle('is-reached', marker.top < trigger);
    });
  };

  /* ---------- Master scroll handler (one rAF per frame) ---------- */
  const progressBar = $('.scroll-progress');
  const nav = $('#nav');
  const toTop = $('#toTop');
  const heroBg = $('.hero__bg');
  const heroContent = $('#heroContent');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    progressBar.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`;
    nav.classList.toggle('is-scrolled', y > 10);

    // Hide nav when scrolling down, show when scrolling up
    if (!document.body.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 400) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y <= 400) nav.classList.remove('is-hidden');
    }

    // Hero parallax + fade
    if (!prefersReduced && y < vh * 1.2) {
      heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      heroContent.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
      heroContent.style.opacity = String(clamp(1 - y / (vh * 0.75)));
    }

    // Word-by-word highlight
    scrubs.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      const p = prefersReduced ? 1 : clamp((vh * 0.82 - r.top) / (vh * 0.55));
      const lit = Math.round(p * s.words.length);
      if (lit !== s.lit) {
        s.words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
        s.lit = lit;
      }
    });

    updateTimeline(vh);
    toTop.classList.toggle('is-visible', y > vh * 1.2);

    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

  /* ---------- Experience accordion ---------- */
  jobs.forEach((job) => {
    const btn = $('.job__toggle', job);
    const label = $('.job__toggle-label', job);
    btn.addEventListener('click', () => {
      const open = !job.classList.contains('is-open');
      job.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Hide details' : 'Show details';
      setTimeout(onScroll, 600); // re-measure timeline after the expand animation
    });
  });

  /* ---------- Projects carousel ---------- */
  const track = $('#projectTrack');
  const cards = $$('.project-card', track);
  const dotsWrap = $('#carouselDots');
  const prevBtn = $('#carouselPrev');
  const nextBtn = $('#carouselNext');
  let current = 0;

  const sidePad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const scrollToCard = (i) => {
    const card = cards[clamp(i, 0, cards.length - 1)];
    track.scrollTo({ left: card.offsetLeft - sidePad(), behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to project ${i + 1}`);
    b.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(b);
  });
  const dots = $$('button', dotsWrap);

  const updateCarousel = () => {
    const x = track.scrollLeft;
    const maxX = track.scrollWidth - track.clientWidth;
    const pad = sidePad();
    let idx = 0;
    let best = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - pad - x);
      if (d < best) { best = d; idx = i; }
    });
    if (x >= maxX - 4) idx = cards.length - 1;
    current = idx;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    prevBtn.disabled = x <= 4;
    nextBtn.disabled = x >= maxX - 4;
  };
  let carouselTick = false;
  track.addEventListener('scroll', () => {
    if (!carouselTick) { requestAnimationFrame(() => { updateCarousel(); carouselTick = false; }); carouselTick = true; }
  }, { passive: true });
  window.addEventListener('resize', updateCarousel);
  prevBtn.addEventListener('click', () => scrollToCard(current - 1));
  nextBtn.addEventListener('click', () => scrollToCard(current + 1));
  updateCarousel();

  /* ---------- Project modal ---------- */
  const PROJECTS = [
    {
      tag: 'Alfa Medicus · Finance transformation',
      title: 'ERP & Finance Transformation',
      metric: { value: '2', label: 'ERP platforms implemented' },
      summary: 'Spearheaded the implementation of Oracle NetSuite and SAP ERP across group entities.',
      points: [
        'Led the NetSuite and SAP ERP implementation',
        'Multi-entity rollout across the APAC group',
        'Part of a wider transformation that also cut month-end close from 15 to 9 days',
      ],
      tags: ['Oracle NetSuite', 'SAP S/4HANA', 'Change management'],
    },
    {
      tag: 'Alfa Medicus · Group reporting',
      title: 'Group Consolidation & Regional Reporting',
      metric: { value: '20', label: 'APAC subsidiaries' },
      summary: 'Monthly group consolidation, reporting and budgeting across subsidiaries in Asia-Pacific.',
      points: [
        'Lead the monthly consolidation and group reporting cycle',
        'Coordinate budgeting across 20 APAC subsidiaries',
        'Supervise and mentor a team of 10',
      ],
      tags: ['Consolidation', 'Multi-entity reporting', 'Budgeting'],
    },
    {
      tag: 'Alfa Medicus · FP&A',
      title: 'FP&A & EBITDA Analysis',
      metric: null,
      summary: 'Budget-versus-actual reporting that gives management a clear view of performance.',
      points: [
        'Budget-versus-actual analysis across revenue, expenses and EBITDA',
        'Management reporting to support decision-making',
        'Monthly budgeting across the group',
      ],
      tags: ['FP&A', 'EBITDA', 'Variance analysis'],
    },
    {
      tag: 'Alfa Medicus · Controls',
      title: 'Process Improvement & Financial Controls',
      metric: { value: '15 → 9', label: 'days to close' },
      summary: 'Standardised procedures and cleaned up legacy balances for a faster, more reliable close.',
      points: [
        'Cut month-end close from 15 days to 9 through SOP standardisation',
        'Cleared a four-year backlog of suspense accounts and unreconciled bank statements',
        'Strengthened financial controls across the reporting process',
      ],
      tags: ['SOPs', 'Reconciliations', 'Financial controls'],
    },
    {
      tag: 'KPMG · Alfa Medicus',
      title: 'M&A & Corporate Transactions',
      metric: null,
      summary: 'Hands-on exposure to the accounting and diligence behind corporate transactions.',
      points: [
        'M&A due diligence and impairment assessments',
        'Entity amalgamation and transaction accounting',
        'Exposure to purchase price allocation (PPA)',
      ],
      tags: ['Due diligence', 'PPA', 'Amalgamation'],
    },
    {
      tag: 'KPMG · Automation',
      title: 'Data Analytics & Automation',
      metric: { value: '3 → 1', label: 'days of testing' },
      summary: 'Alteryx and Excel VBA tools that take manual effort out of finance and audit work.',
      points: [
        'Built an Alteryx fixed-asset depreciation tool that cut testing from three days to one',
        'Excel VBA automation for recurring finance and audit tasks',
        'Alteryx Designer Core certified',
      ],
      tags: ['Alteryx', 'Excel VBA', 'Power Query'],
    },
  ];

  const modal = $('#projectModal');
  const mTag = $('#modalTag');
  const mTitle = $('#modalTitle');
  const mMetric = $('#modalMetric');
  const mSummary = $('#modalSummary');
  const mPoints = $('#modalPoints');
  const mTags = $('#modalTags');
  let lastTrigger = null;

  const fillList = (ul, items) => {
    ul.replaceChildren(...items.map((txt) => { const li = document.createElement('li'); li.textContent = txt; return li; }));
  };

  const openModal = (i, trigger) => {
    const p = PROJECTS[i];
    if (!p || typeof modal.showModal !== 'function') return;
    lastTrigger = trigger;
    mTag.textContent = p.tag;
    mTitle.textContent = p.title;
    mMetric.replaceChildren();
    if (p.metric) {
      const strong = document.createElement('strong'); strong.textContent = p.metric.value;
      const span = document.createElement('span'); span.textContent = p.metric.label;
      mMetric.append(strong, span);
    }
    mSummary.textContent = p.summary;
    fillList(mPoints, p.points);
    fillList(mTags, p.tags);
    modal.showModal();
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    if (!modal.open) return;
    if (prefersReduced) { modal.close(); return; }
    modal.classList.add('is-closing');
    const done = (e) => {
      if (e.target !== modal) return;
      modal.removeEventListener('animationend', done);
      modal.classList.remove('is-closing');
      modal.close();
    };
    modal.addEventListener('animationend', done);
  };

  cards.forEach((card, i) => card.addEventListener('click', () => openModal(i, card)));
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); }); // backdrop click
  modal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });   // Esc key
  modal.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    lastTrigger?.focus({ preventScroll: true });
  });

  /* ---------- Expertise segmented control ---------- */
  const seg = $('.segmented');
  const pill = $('.segmented__pill', seg);
  const tabs = $$('[role="tab"]', seg);
  const panels = $$('.tab-panel');
  panels.forEach((p) => $$('.chip', p).forEach((c, i) => c.style.setProperty('--i', i)));

  const movePill = (tab) => {
    pill.style.width = `${tab.offsetWidth}px`;
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  const activateTab = (tab, { focus = false, scroll = false } = {}) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => p.classList.toggle('is-active', p.id === tab.getAttribute('aria-controls')));
    movePill(tab);
    if (focus) tab.focus();
    if (scroll) {
      seg.scrollTo({ left: tab.offsetLeft - (seg.clientWidth - tab.offsetWidth) / 2, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab, { scroll: true }));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      activateTab(next, { focus: true, scroll: true });
    });
  });
  const resetPill = () => movePill(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  resetPill();
  window.addEventListener('resize', resetPill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resetPill);

  /* ---------- Qualification cards: spotlight + 3D tilt (desktop only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced) {
    $$('.qual').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Resume links + articles (data lives in content.js) ---------- */
  const CONTENT = window.SITE_CONTENT || {};
  const resume = CONTENT.resume || {};
  if (resume.file) {
    $$('[data-resume-view]').forEach((a) => { a.href = resume.file; });
    $$('[data-resume-download]').forEach((a) => {
      a.href = resume.file;
      a.setAttribute('download', resume.downloadName || '');
      a.removeAttribute('target');
    });
    $$('[data-resume-updated]').forEach((el) => { el.textContent = resume.updated ? `Last updated ${resume.updated}` : ''; });
  }

  const articleList = $('#articleList');
  if (articleList) {
    const articles = Array.isArray(CONTENT.articles) ? CONTENT.articles.filter((a) => a && a.title && a.url) : [];
    if (!articles.length) {
      articleList.innerHTML = '<div class="article-empty"><strong>Articles coming soon</strong><span>Insights on consolidation, FP&amp;A and finance transformation.</span></div>';
    } else {
      articles.forEach((item) => {
        const a = document.createElement('a');
        a.className = 'article-item';
        a.href = item.url;
        if (item.download) a.setAttribute('download', '');
        else { a.target = '_blank'; a.rel = 'noopener'; }

        const meta = document.createElement('span');
        meta.className = 'article-item__meta';
        const type = document.createElement('span');
        type.className = 'article-item__type';
        type.textContent = item.type || 'Article';
        meta.append(type);
        if (item.date) { const d = document.createElement('span'); d.textContent = item.date; meta.append(d); }

        const title = document.createElement('span');
        title.className = 'article-item__title';
        title.textContent = item.title;

        const arrow = document.createElement('span');
        arrow.className = 'article-item__arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.innerHTML = item.download
          ? '<svg class="i" viewBox="0 0 24 24"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16"/></svg>'
          : '<svg class="i" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>';

        a.append(meta, title);
        if (item.summary) {
          const sum = document.createElement('span');
          sum.className = 'article-item__summary';
          sum.textContent = item.summary;
          a.append(sum);
        }
        a.append(arrow);
        articleList.append(a);
      });
    }
  }

  /* ---------- Copy email + toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };
  $('#copyEmail')?.addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  });
})();
