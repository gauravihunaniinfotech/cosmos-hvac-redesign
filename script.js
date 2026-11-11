/* =========================================================
   Cosmo's Heating & Air Conditioning – script.js
   Vanilla JS, no dependencies. Shared by all four pages;
   every feature checks that its elements exist first.
   Sections: helpers · header/nav · smooth scroll · reveal ·
   parallax · counters · project gallery (filters + lightbox) ·
   service chips · reviews · plans · form
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sticky state, progress bar, mobile menu ---------- */
  const header   = $('#header');
  const progress = $('#progress');
  const toTop    = $('#to-top');
  const gFloat   = $('.google-float');
  const burger   = $('#burger');
  const nav      = $('#nav');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }
  if (burger && nav) {
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', e => {
      if (nav.classList.contains('is-open') && !e.target.closest('#header')) setMenu(false);
    });
  }
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Smooth scroll for in-page links + pre-select a service ---------- */
  function headerOffset() {
    const chips = $('#svc-nav');
    return header.offsetHeight + (chips ? chips.offsetHeight : 0) + 8;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    const target = $(hash);
    if (!target) return;
    e.preventDefault();

    const svc = a.dataset.service;
    if (svc) {
      const select = $('#service');
      if (select) select.value = svc;
    }
    const y = target.getBoundingClientRect().top + window.scrollY - (hash === '#home' ? 0 : headerOffset() - 16);
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
    if (hash === '#contact') setTimeout(() => { const f = $('#fname'); if (f) f.focus({ preventScroll: true }); }, 700);
  });

  // Landing on a page with #hash (from another page): correct for the sticky header
  if (location.hash.length > 1) {
    const t = $(location.hash);
    if (t) window.addEventListener('load', () => {
      setTimeout(() => window.scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + window.scrollY - headerOffset() + 16) }), 60);
    });
  }

  // Pre-select a service on pages that ask for it (e.g. Comfort Club page)
  const pre = $('[data-preselect]');
  if (pre && $('#service')) $('#service').value = pre.dataset.preselect;

  /* ---------- Scroll-reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Parallax + scroll-linked UI (single rAF loop) ---------- */
  const parallaxEls = $$('[data-parallax]');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const doc = document.documentElement;

    header.classList.toggle('is-stuck', y > 30);
    const max = doc.scrollHeight - vh;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (toTop) toTop.classList.toggle('is-on', y > 700);
    if (gFloat) gFloat.classList.toggle('is-on', y > 600);

    if (!reduceMotion) {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const isHero = el.classList.contains('hero__bg');
        const shift = isHero ? y * speed : (rect.top + rect.height / 2 - vh / 2) * -speed;
        el.style.translate = '0 ' + shift.toFixed(1) + 'px';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Badge: gentle pointer tilt ---------- */
  $$('[data-tilt]').forEach(el => {
    if (reduceMotion) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(500px) rotateX(' + (-py * 22) + 'deg) rotateY(' + (px * 22) + 'deg) scale(1.05)';
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- Animated counters ---------- */
  function runCounter(el) {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) { el.textContent = end.toFixed(dec); return; }
    const dur = 1600, t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { runCounter(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(c => co.observe(c));
  }

  /* ---------- Project gallery: filters + "show more" (home page) ---------- */
  const grid = $('#work-grid');
  if (grid) {
    const cards   = $$('.work-card', grid);
    const chips   = $$('#work-filters .chip');
    const moreBtn = $('#work-more');
    const empty   = $('#work-empty');
    let filter = 'all', expanded = false;

    function applyFilter() {
      let shown = 0;
      cards.forEach(card => {
        const cats = card.dataset.cat.split(' ');
        const match = filter === 'all' || cats.includes(filter);
        const hideExtra = filter === 'all' && !expanded && card.classList.contains('is-extra');
        const visible = match && !hideExtra;
        if (visible && card.hidden) { card.hidden = false; card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
        else if (!visible) { card.hidden = true; card.classList.remove('pop'); }
        if (visible) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (moreBtn) {
        const hasExtra = filter === 'all' && cards.some(c => c.classList.contains('is-extra'));
        moreBtn.hidden = !hasExtra;
        moreBtn.firstChild.textContent = expanded ? 'Show Fewer Projects ' : 'Show More Projects ';
      }
    }
    chips.forEach(chip => chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      chips.forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      applyFilter();
    }));
    if (moreBtn) moreBtn.addEventListener('click', () => { expanded = !expanded; applyFilter(); });
    applyFilter();
  }

  /* ---------- Lightbox (any [data-lightbox] button on the page) ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const lbImg = $('#lb-img'), lbTitle = $('#lb-title'), lbCount = $('#lb-count');
    let list = [], lbIndex = 0, lastFocus = null;

    const visibleItems = () => $$('[data-lightbox]').filter(b => !b.closest('[hidden]'));
    function showLb(i) {
      lbIndex = (i + list.length) % list.length;
      const b = list[lbIndex];
      lbImg.classList.remove('is-in');
      lbImg.src = b.dataset.full;
      lbImg.alt = b.dataset.title || '';
      lbTitle.textContent = (b.dataset.cat ? b.dataset.cat + ' · ' : '') + (b.dataset.title || '');
      lbCount.textContent = (lbIndex + 1) + ' / ' + list.length;
      requestAnimationFrame(() => lbImg.classList.add('is-in'));
    }
    function openLb(btn) {
      list = visibleItems();
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      showLb(Math.max(0, list.indexOf(btn)));
      $('#lb-close').focus();
    }
    function closeLb() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-lightbox]');
      if (btn) openLb(btn);
    });
    $('#lb-close').addEventListener('click', closeLb);
    $('#lb-prev').addEventListener('click', () => showLb(lbIndex - 1));
    $('#lb-next').addEventListener('click', () => showLb(lbIndex + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox__fig')) closeLb(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      if (e.key === 'ArrowRight') showLb(lbIndex + 1);
      if (e.key === 'Tab') {
        const f = $$('button', lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // simple swipe on touch screens
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------- Services page: highlight the chip of the section in view ---------- */
  const svcNav = $('#svc-nav');
  if (svcNav && 'IntersectionObserver' in window) {
    const links = $$('.chip', svcNav);
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.remove('is-on'));
        const l = map.get(en.target.id);
        if (l) {
          l.classList.add('is-on');
          // scroll only the chip bar sideways (scrollIntoView would also move the page vertically)
          const bar = l.parentElement;
          bar.scrollTo({ left: l.offsetLeft - (bar.clientWidth - l.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Reviews slider (home page) ----------
     Add REAL customer reviews here (copy them from Google), e.g.
       { text: 'Paste the review text exactly as written.', name: 'First L.', rating: 5 }
     With an empty list the slider shows Cosmo's own promise instead,
     so the site never displays invented testimonials.               */
  const REVIEWS = [
    // { text: '', name: '', rating: 5 },
  ];

  const viewport = $('#review-viewport');
  if (viewport) {
    const controls = $('#review-controls');
    const dots     = $('#r-dots');
    let rIndex = 0, rTimer = null;

    const starSvg = n => '<span class="stars" role="img" aria-label="' + n + ' out of 5 stars">' +
      '<svg aria-hidden="true"><use href="#i-star"/></svg>'.repeat(n) + '</span>';

    function renderSlide() {
      if (!REVIEWS.length) {
        viewport.innerHTML =
          '<figure class="slide">' +
            '<svg class="slide__q" aria-hidden="true"><use href="#i-quote"/></svg>' +
            '<p class="slide__label">Our promise</p>' +
            '<blockquote>At Cosmo’s, we treat your home like our own — honest service, transparent pricing, and year-round protection.</blockquote>' +
            '<figcaption>Cosmo’s Heating and Air Conditioning &middot; Man’s Most Reliable</figcaption>' +
          '</figure>';
        return;
      }
      const r = REVIEWS[rIndex];
      viewport.innerHTML =
        '<figure class="slide">' +
          '<svg class="slide__q" aria-hidden="true"><use href="#i-quote"/></svg>' +
          '<blockquote>“' + esc(r.text) + '”</blockquote>' +
          '<figcaption>' + starSvg(r.rating || 5) + '<span>' + esc(r.name) + ' &middot; Google review</span></figcaption>' +
        '</figure>';
      $$('button', dots).forEach((d, i) => d.setAttribute('aria-current', String(i === rIndex)));
    }
    const goReview = i => { rIndex = (i + REVIEWS.length) % REVIEWS.length; renderSlide(); };
    function autoplay() {
      clearInterval(rTimer);
      if (REVIEWS.length > 1 && !reduceMotion) rTimer = setInterval(() => goReview(rIndex + 1), 7000);
    }
    if (REVIEWS.length > 1) {
      controls.hidden = false;
      REVIEWS.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show review ' + (i + 1));
        b.addEventListener('click', () => { goReview(i); autoplay(); });
        dots.appendChild(b);
      });
      $('#r-prev').addEventListener('click', () => { goReview(rIndex - 1); autoplay(); });
      $('#r-next').addEventListener('click', () => { goReview(rIndex + 1); autoplay(); });
      $('#review-slider').addEventListener('mouseenter', () => clearInterval(rTimer));
      $('#review-slider').addEventListener('mouseleave', autoplay);
    }
    renderSlide();
    autoplay();
  }

  /* ---------- Comfort Club plans ----------
     The page ships with one plan card (no prices are invented). To show
     real plans, fill this array and they replace the default card:
       { name:'Plan name', price:'$00/mo', features:['…','…'], featured:true }   */
  const PLANS = [
    // { name: '', price: '', features: [''], featured: false },
  ];
  const plansGrid = $('#plans-grid');
  if (plansGrid && PLANS.length) {
    plansGrid.innerHTML = PLANS.map(p =>
      '<article class="plan reveal is-in' + (p.featured ? ' plan--featured' : '') + '">' +
        (p.featured ? '<span class="plan__flag">Most Popular</span>' : '') +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="plan__price">' + esc(p.price) + '</p>' +
        '<ul class="checks checks--dark">' + p.features.map(f => '<li><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>' + esc(f) + '</li>').join('') + '</ul>' +
        '<a class="btn btn--green btn--block btn--lg" href="#contact" data-service="Cosmo\'s Comfort Club">Join This Plan</a>' +
      '</article>').join('');
    plansGrid.classList.add('plans__grid--multi');
  }

  /* ---------- Contact form ----------
     Static site: validates, then opens the visitor's email app addressed to
     service@cosmosaclv.com with the message pre-filled. To post to a form
     service (Formspree, Netlify Forms…), replace sendViaMailto().        */
  const form   = $('#contact-form');
  const status = $('#form-status');

  function setError(input, msg) {
    const field = input.closest('.field');
    field.classList.toggle('has-error', !!msg);
    let err = $('.field__err', field);
    if (msg) {
      if (!err) {
        err = document.createElement('span');
        err.className = 'field__err';
        err.id = input.id + '-err';
        field.appendChild(err);
      }
      err.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', err.id);
    } else {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }
  function validate() {
    let first = null;
    const fname = $('#fname'), email = $('#email'), phone = $('#phone');
    const rules = [
      [fname, !fname.value.trim() ? 'Please enter your first name.' : ''],
      [email, !email.value.trim() ? 'Please enter your email.' :
              !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? 'Please enter a valid email address.' : ''],
      [phone, phone.value.trim() && phone.value.replace(/\D/g, '').length < 7 ? 'Please enter a valid phone number.' : '']
    ];
    rules.forEach(([el, msg]) => { setError(el, msg); if (msg && !first) first = el; });
    return first;
  }
  function sendViaMailto(data) {
    const subject = 'Free estimate request' + (data.service ? ' – ' + data.service : '');
    const body = [
      'Name: ' + data.first + ' ' + data.last,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || '—'),
      'Interested service: ' + (data.service || '—'),
      '',
      data.message || ''
    ].join('\n');
    window.location.href = 'mailto:service@cosmosaclv.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      status.className = 'form__status';
      const bad = validate();
      if (bad) {
        status.textContent = 'Please fix the highlighted fields.';
        status.classList.add('is-err');
        bad.focus();
        return;
      }
      const fd = Object.fromEntries(new FormData(form).entries());
      sendViaMailto(fd);
      status.textContent = 'Thanks, ' + fd.first + '! Your email app is opening with your request. You can also call us at +1 (702) 960-5555.';
      status.classList.add('is-ok');
    });
    form.addEventListener('input', e => { if (e.target.closest('.field.has-error')) setError(e.target, ''); });
  }
})();
