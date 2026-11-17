/* OrientalGiftShop.com core script */
(function () {
  'use strict';
  var C = window.OGS_CONFIG || {};
  var doc = document, html = doc.documentElement;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('ogs_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('ogs_' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var sess = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem('ogs_' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('ogs_' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var params = new URLSearchParams(location.search);
  function abs(rel) { return new URL(rel, doc.baseURI).href; }
  var dataCache = {};
  function data(name) {
    if (!dataCache[name]) dataCache[name] = fetch(abs('assets/data/' + name + '.json')).then(function (r) { return r.json(); });
    return dataCache[name];
  }
  function toast(msg) {
    var t = doc.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    doc.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  function findLink(q, kind) {
    var a = (C.affiliates || {})[kind || 'etsy'];
    if (a) return a.replace('{q}', encodeURIComponent(q));
    return kind === 'amazon' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(q) : 'https://www.etsy.com/search?q=' + encodeURIComponent(q);
  }
  /* Upcoming festival occurrences from festivals.json */
  function upcoming(list, from) {
    var out = [];
    list.forEach(function (f) {
      f.dates.forEach(function (d) {
        var dt = new Date(d + 'T00:00:00');
        var end = new Date(dt.getTime() + (f.span || 1) * 864e5);
        if (end > from) out.push({ f: f, date: dt });
      });
    });
    return out.sort(function (a, b) { return a.date - b.date; });
  }

  window.OGS = { $: $, $$: $$, esc: esc, store: store, params: params, abs: abs, data: data, toast: toast, findLink: findLink, upcoming: upcoming,
    cta: function (title, text) {
      return '<aside class="lead-cta lead-inline"><div><p class="eyebrow">Free Gift Concierge</p><h3>' + esc(title) + '</h3><p>' + esc(text || 'Corporate, wedding or bulk order? Get a curated, culturally checked shortlist with supplier options in 48 hours. Free.') + '</p></div><a class="btn btn-red" href="concierge.html?src=tool">Get my free proposal</a></aside>';
    }
  };

  /* In-page anchors (pages use <base href>, so bare #links would jump to the home page) */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) {
      var id = a.getAttribute('href').slice(1);
      e.preventDefault();
      if (!id) return;
      var t = doc.getElementById(id);
      if (t) {
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
        try { history.replaceState(null, '', location.pathname + location.search + '#' + id); } catch (er) { }
      }
      return;
    }
    var y = e.target.closest && e.target.closest('.yt');
    if (y) {
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + y.getAttribute('data-id') + '?autoplay=1&rel=0';
      f.title = y.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      y.parentNode.replaceChild(f, y);
    }
  });

  /* Navigation */
  var burger = $('#burger');
  if (burger) burger.addEventListener('click', function () {
    var open = doc.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('.sub-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.parentNode, open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.has-sub.open').forEach(function (li) { li.classList.remove('open'); }); });
  var here = location.pathname.replace(/index\.html$/, '');
  $$('#nav a').forEach(function (a) {
    var p = new URL(a.getAttribute('href'), doc.baseURI).pathname.replace(/index\.html$/, '');
    if (p.length > 1 && here.indexOf(p) === 0 && here.length - p.length < 60) a.setAttribute('aria-current', 'page');
  });

  /* Dates */
  var now = new Date();
  $$('[data-year]').forEach(function (el) { el.textContent = now.getFullYear(); });
  $$('[data-month]').forEach(function (el) { el.textContent = now.toLocaleString('en-US', { month: 'long', year: 'numeric' }); });
  $$('[data-config]').forEach(function (el) {
    var v = el.getAttribute('data-config').split('.').reduce(function (o, k) { return o && o[k]; }, C);
    if (v) el.textContent = v;
  });

  /* Self-updating: next festival ribbon + countdowns */
  function fmtDate(d) { return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  data('festivals').then(function (list) {
    var up = upcoming(list, now);
    if (!up.length) return;
    var next = up[0], days = Math.ceil((next.date - now) / 864e5);
    var rb = $('#ribbon');
    if (rb && !doc.body.classList.contains('no-ribbon')) {
      rb.innerHTML = '<div class="wrap">' + (days > 0 ? '<strong>' + esc(next.f.name) + '</strong> is in ' + days + ' day' + (days === 1 ? '' : 's') + ' (' + fmtDate(next.date) + '). ' : '<strong>' + esc(next.f.name) + '</strong> is happening now. ') + '<a href="' + esc(next.f.guide || 'festivals.html') + '">What to give →</a></div>';
      rb.hidden = false;
    }
    $$('[data-countdown]').forEach(function (el) {
      var pick = up.filter(function (o) { return o.f.major; })[0] || next;
      var nm = $('.cd-name', el), dt = $('.cd-date', el), link = $('a', el);
      if (nm) nm.textContent = pick.f.name;
      if (dt) dt.textContent = fmtDate(pick.date) + ' · ' + pick.f.region;
      if (link && pick.f.guide) link.href = pick.f.guide;
      function tick() {
        var ms = Math.max(0, pick.date - new Date());
        var parts = [Math.floor(ms / 864e5), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60];
        $$('.cd-time b', el).forEach(function (b, i) { b.textContent = parts[i]; });
      }
      tick(); setInterval(tick, 30000);
    });
  }).catch(function () { });

  /* News (assets/data/news.json, refreshed daily by automation/fetch_news.py) */
  var nl = $('[data-news]');
  if (nl) data('news').then(function (items) {
    nl.innerHTML = items.length ? '<ul class="news-list">' + items.slice(0, 24).map(function (i) { return '<li><a href="' + esc(i.url) + '" target="_blank" rel="noopener nofollow">' + esc(i.title) + '</a><span>' + esc(i.source || '') + (i.date ? ' · ' + esc(i.date) : '') + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">Fresh headlines appear here once the daily update runs. Meanwhile, see the <a href="festivals.html">festival calendar</a>.</p>';
  }).catch(function () { });

  /* Gift of the day (rotates daily from gifts.json) */
  var gotd = $('[data-gift-of-day]');
  if (gotd) data('gifts').then(function (g) {
    var day = Math.floor((now.getTime() - now.getTimezoneOffset() * 6e4) / 864e5);
    var x = g[day % g.length];
    gotd.innerHTML = '<p class="eyebrow">Gift idea of the day</p><h3>' + esc(x.name) + '</h3><p>' + esc(x.why) + '</p><p>' + x.cultures.map(function (c) { return '<span class="tag">' + esc(c) + '</span>'; }).join('') + '</p><a class="btn btn-ghost btn-sm" href="gift-ideas.html?q=' + encodeURIComponent(x.name) + '">See similar ideas</a>';
  }).catch(function () { });

  /* Ad slots: filled only when slot IDs are set in config.js */
  var slots = C.adSlots || {};
  if (doc.querySelector('script[src*="adsbygoogle"]')) {
    $$('.ad-slot').forEach(function (s) {
      var id = slots[s.getAttribute('data-slot')];
      if (!id) return;
      s.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6620975821265271" data-ad-slot="' + esc(id) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      s.classList.add('on');
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { }
    });
  }

  /* First-touch attribution for leads */
  if (!sess.get('src')) {
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'src'].forEach(function (k) { if (params.get(k)) utm[k] = params.get(k); });
    sess.set('src', { landing: location.pathname + location.search, ref: doc.referrer || '', utm: utm });
  }

  /* Forms: FormSubmit with an encoded inbox */
  function inbox() {
    return String.fromCharCode.apply(null, (C.inbox || []).slice().reverse().map(function (c) { return c ^ 23; }));
  }
  function collect(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      if (k === '_honey' || v === '' || (v && v.name !== undefined && v.size !== undefined)) return;
      o[k] = o[k] ? o[k] + ', ' + v : v;
    });
    return o;
  }
  function scoreLead(form) {
    var s = 0;
    $$('input[data-score]:checked, option[data-score]:checked', form).forEach(function (el) { s += parseInt(el.getAttribute('data-score'), 10) || 0; });
    var ph = form.querySelector('[name=phone]');
    if (ph && ph.value.replace(/\D/g, '').length >= 7) s += 10;
    var co = form.querySelector('[name=company]');
    if (co && co.value.trim()) s += 10;
    return Math.max(0, Math.min(100, s));
  }
  function send(form) {
    var type = form.getAttribute('data-form') || 'form';
    var data = collect(form), src = sess.get('src') || {};
    if (form.hasAttribute('data-score')) data.lead_score = scoreLead(form);
    data._subject = 'OrientalGiftShop.com: ' + (form.getAttribute('data-subject') || type) + (data.occasion ? ' (' + data.occasion + ')' : '') + (data.lead_score != null ? ' | score ' + data.lead_score : '');
    data._template = 'table';
    data.form_type = type;
    data.page = location.href;
    data.landing_page = src.landing || '';
    data.referrer = src.ref || '';
    data.campaign = JSON.stringify(src.utm || {});
    data.submitted_at = new Date().toString();
    var btn = form.querySelector('[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    function done() {
      sess.set('last_form', type);
      var msg = form.getAttribute('data-inline');
      if (msg) form.innerHTML = '<div class="success" role="status"><h3>Thank you!</h3><p>' + esc(msg) + '</p></div>';
      else location.href = abs('thank-you.html?f=' + encodeURIComponent(type));
    }
    function fallback() {
      var f = doc.createElement('form');
      f.method = 'POST';
      f.action = 'https://formsubmit.co/' + inbox();
      f.style.display = 'none';
      data._next = abs('thank-you.html?f=' + encodeURIComponent(type));
      data._captcha = 'false';
      Object.keys(data).forEach(function (k) {
        var i = doc.createElement('input'); i.type = 'hidden'; i.name = k; i.value = data[k]; f.appendChild(i);
      });
      doc.body.appendChild(f);
      f.submit();
    }
    fetch((C.formEndpoint || 'https://formsubmit.co/ajax/') + inbox(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && String(j.success) !== 'false') done(); else fallback();
      });
    }).catch(fallback);
  }
  window.OGS.send = send;

  /* Pre-fill from the URL, e.g. concierge.html?occasion=Lunar%20New%20Year */
  params.forEach(function (v, k) {
    if (!/^[a-z_]{2,20}$/.test(k)) return;
    $$('form [name="' + k + '"]').forEach(function (el) {
      if (el.type === 'radio' || el.type === 'checkbox') { if (el.value === v) el.checked = true; }
      else if (el.type !== 'hidden' && !el.value) el.value = v;
    });
  });

  /* Multi-step forms */
  $$('form[data-steps]').forEach(function (form) {
    form.noValidate = true;
    var steps = $$('.step', form), i = 0;
    var bar = $('.progress span', form), lab = $('.progress-label', form);
    function show(n) {
      steps.forEach(function (s, k) { s.hidden = k !== n; });
      i = n;
      if (bar) bar.style.width = Math.round((n + 1) / steps.length * 100) + '%';
      if (lab) lab.textContent = 'Step ' + (n + 1) + ' of ' + steps.length;
      var sb = form.querySelector('[type=submit]'), pb = form.querySelector('[data-prev]');
      if (sb) { if (!sb.getAttribute('data-mid')) sb.setAttribute('data-mid', sb.textContent); sb.textContent = n === steps.length - 1 ? (form.getAttribute('data-final') || 'Send') : sb.getAttribute('data-mid'); }
      if (pb) pb.style.visibility = n === 0 ? 'hidden' : 'visible';
    }
    function valid(s) {
      var els = $$('input,select,textarea', s);
      for (var k = 0; k < els.length; k++) { if (!els[k].checkValidity()) { els[k].reportValidity(); return false; } }
      return true;
    }
    form._stepper = {
      last: function () { return i === steps.length - 1; },
      next: function () { if (valid(steps[i])) { show(Math.min(i + 1, steps.length - 1)); form.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }
    };
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-next],[data-prev]');
      if (!b) return;
      e.preventDefault();
      if (b.hasAttribute('data-next')) form._stepper.next();
      else { show(Math.max(i - 1, 0)); form.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    });
    form.addEventListener('change', function (e) {
      var st = steps[i];
      if (st && st.hasAttribute('data-auto') && e.target.type === 'radio') setTimeout(function () { form._stepper.next(); }, 180);
    });
    show(0);
  });

  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form._stepper && !form._stepper.last()) { form._stepper.next(); return; }
      var hp = form.querySelector('[name=_honey]');
      if (hp && hp.value) { form.innerHTML = '<div class="success"><h3>Thank you!</h3></div>'; return; }
      if (!form.reportValidity()) return;
      send(form);
    });
  });

  /* Support page: amount picker */
  var dz = $('#donate');
  if (dz) {
    var amt = 25, freq = 'one-time';
    var D = C.donate || {};
    function sync() {
      $$('[data-amt]', dz).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-amt') === amt)); });
      $$('[data-freq]', dz).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-freq') === freq)); });
      var out = $('#donateSummary'); if (out) out.textContent = 'US$' + amt + (freq === 'monthly' ? ' a month' : ' one time');
      var pa = $('#pledgeAmount'); if (pa) pa.value = amt + ' ' + freq;
      var link = freq === 'monthly' ? (D.stripeMonthly || D.paypal || D.bmc) : (D.stripe || D.paypal || D.bmc);
      var go = $('#donateGo');
      if (go) { if (link) { go.href = link; go.target = '_blank'; go.rel = 'noopener'; go.textContent = 'Continue to secure payment'; } else { go.href = '#pledge'; go.removeAttribute('target'); go.textContent = 'Pledge this amount'; } }
    }
    dz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-amt],[data-freq]');
      if (!b) return;
      if (b.hasAttribute('data-amt')) amt = +b.getAttribute('data-amt');
      if (b.hasAttribute('data-freq')) freq = b.getAttribute('data-freq');
      sync();
    });
    var custom = $('#customAmt', dz);
    if (custom) custom.addEventListener('input', function () { var v = Math.round(+custom.value); if (v > 0) { amt = v; sync(); } });
    sync();
  }

  /* Share / copy / print / helpful */
  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-share-native]')) {
      if (navigator.share) navigator.share({ title: doc.title, url: location.href }).catch(function () { });
      else { navigator.clipboard && navigator.clipboard.writeText(location.href); toast('Link copied'); }
    } else if (t.closest('[data-copy-link]')) {
      navigator.clipboard && navigator.clipboard.writeText(location.href).then(function () { toast('Link copied'); });
    } else if (t.closest('[data-print]')) {
      window.print();
    } else if (t.closest('[data-vote]')) {
      var box = t.closest('[data-helpful]');
      store.set('vote_' + box.getAttribute('data-helpful'), t.getAttribute('data-vote'));
      box.innerHTML = t.getAttribute('data-vote') === 'yes' ? '<p>Thank you! Share it with someone who is shopping for a gift.</p>' : '<p>Thanks for telling us. <a href="contact.html?topic=feedback">Tell us what was missing</a> and we will improve it.</p>';
    } else if (t.closest('[data-dismiss-sticky]')) {
      store.set('sticky_off', Date.now());
      $('#stickyLead').hidden = true;
    } else if (t.closest('[data-copy]')) {
      var txt = t.closest('[data-copy]').getAttribute('data-copy');
      navigator.clipboard && navigator.clipboard.writeText(txt).then(function () { toast('Copied: ' + txt); });
    }
  });

  /* Filter chips (guides index) */
  $$('[data-filter-group]').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b) return;
      $$('[data-filter]', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.getAttribute('data-filter');
      $$('#guideGrid .card').forEach(function (c) { c.hidden = f !== 'all' && c.getAttribute('data-cat') !== f; });
    });
  });

  /* Sticky lead bar */
  var sl = $('#stickyLead');
  var off = store.get('sticky_off', 0);
  if (sl && C.stickyLead !== false && !doc.body.classList.contains('no-sticky') && (Date.now() - off > 3 * 864e5)) {
    var shown = false;
    window.addEventListener('scroll', function () {
      if (shown) return;
      var pct = (window.scrollY + window.innerHeight) / doc.documentElement.scrollHeight;
      if (pct > 0.4 && window.scrollY > 700 && store.get('cookie_ok', false)) { sl.hidden = false; shown = true; }
    }, { passive: true });
  }

  /* Thank-you page message */
  var ty = $('#tyMsg');
  if (ty) {
    var f = params.get('f') || '';
    var MSG = {
      concierge: 'Your gifting brief is in. A gift specialist will email you a curated shortlist with supplier options within 48 hours (one business day for rush orders). Check your spam folder just in case.',
      seller: 'Thanks for applying. We review every shop by hand and reply within three business days.',
      pledge: 'Thank you for supporting OrientalGiftShop.com. We will email you a secure payment link within one business day.',
      contest: 'You are entered! Winners are chosen after the contest closes and contacted by email.',
      careers: 'Application received. If there is a fit, we will reply within a week.',
      advertise: 'Thanks. We will send our media kit, audience numbers and availability within two business days.',
      contact: 'Message received. We reply to most messages within two business days.'
    };
    if (MSG[f]) ty.textContent = MSG[f];
  }

  /* Site search */
  var sBox = $('#searchInput');
  if (sBox) {
    fetch(abs('search.json')).then(function (r) { return r.json(); }).then(function (idx) {
      var out = $('#searchResults');
      function run() {
        var q = sBox.value.trim().toLowerCase();
        if (!q) { out.innerHTML = ''; return; }
        var terms = q.split(/\s+/);
        var res = idx.filter(function (p) {
          var h = (p.t + ' ' + p.d + ' ' + p.k).toLowerCase();
          return terms.every(function (t) { return h.indexOf(t) > -1; });
        }).slice(0, 40);
        out.innerHTML = res.length ? res.map(function (r) { return '<li><a href="' + esc(r.u) + '">' + esc(r.t) + '</a><p>' + esc(r.d) + '</p></li>'; }).join('') : '<li>No matches. Try "Lunar New Year", "wedding" or "Japan".</li>';
      }
      sBox.addEventListener('input', run);
      if (params.get('q')) { sBox.value = params.get('q'); run(); }
    }).catch(function () { });
  }

  /* Cookie notice */
  if (C.cookieNotice !== false && !store.get('cookie_ok', false)) {
    var cb = doc.createElement('div');
    cb.className = 'cookie';
    cb.setAttribute('role', 'region');
    cb.setAttribute('aria-label', 'Cookie notice');
    cb.innerHTML = '<p>We use cookies for ads (Google AdSense), embedded videos and to remember your saved gifts. <a href="privacy.html">Privacy policy</a></p><button class="btn btn-red btn-sm" type="button">OK</button>';
    doc.body.appendChild(cb);
    cb.querySelector('button').addEventListener('click', function () { store.set('cookie_ok', true); cb.parentNode.removeChild(cb); });
  }
})();
