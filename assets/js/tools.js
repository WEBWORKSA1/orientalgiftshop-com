/* OrientalGiftShop.com interactive tools. Each tool runs only if its root element is on the page. */
(function () {
  'use strict';
  var O = window.OGS; if (!O) return;
  var $ = O.$, $$ = O.$$, esc = O.esc, store = O.store, params = O.params;
  var CUL = { cn: 'China', jp: 'Japan', kr: 'Korea', in: 'India', vn: 'Vietnam', th: 'Thailand' };
  var BUD = ['', 'Under $25', '$25–75', '$75–200', '$200+'];
  var VERD = { lucky: ['tag-ok', 'Lucky'], ok: ['tag-ok', 'Fine'], caution: ['tag-warn', 'Use care'], avoid: ['tag-no', 'Avoid'] };

  function favs() { return store.get('favs', []); }
  function toggleFav(name) {
    var f = favs(), i = f.indexOf(name);
    if (i > -1) f.splice(i, 1); else f.push(name);
    store.set('favs', f); return i === -1;
  }
  function giftCard(g, extra) {
    var on = favs().indexOf(g.name) > -1;
    return '<article class="result-card gift-item"><h3>' + esc(g.name) + '</h3>' +
      '<p>' + g.cultures.map(function (c) { return '<span class="tag">' + esc(c) + '</span>'; }).join('') + '<span class="tag">' + BUD[g.budget] + '</span></p>' +
      '<p>' + esc(g.why) + '</p><p><strong>Tip:</strong> ' + esc(g.tip) + '</p>' + (extra || '') +
      '<div class="actions"><a class="btn btn-ghost btn-sm" href="' + esc(O.findLink(g.q, 'etsy')) + '" target="_blank" rel="sponsored noopener">Find on Etsy</a>' +
      '<a class="btn btn-ghost btn-sm" href="' + esc(O.findLink(g.q, 'amazon')) + '" target="_blank" rel="sponsored noopener">Find on Amazon</a>' +
      '<button type="button" class="chip fav" data-fav="' + esc(g.name) + '" aria-pressed="' + on + '">' + (on ? '♥ Saved' : '♡ Save') + '</button></div></article>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]'); if (!b) return;
    var on = toggleFav(b.getAttribute('data-fav'));
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '♥ Saved' : '♡ Save';
    O.toast(on ? 'Saved to your gift list' : 'Removed from your list');
    var c = $('#favCount'); if (c) c.textContent = favs().length;
  });

  /* ---------- Gift Finder ---------- */
  var gf = $('[data-tool=gift-finder]');
  if (gf) O.data('gifts').then(function (G) {
    var form = $('form', gf), out = $('#gfResult');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form._step < form._steps.length - 1) return;
      run();
    });
    var steps = $$('.step', form); form._steps = steps; form._step = 0;
    var bar = $('.progress span', gf), lab = $('.progress-label', gf);
    function show(n) {
      form._step = n; steps.forEach(function (s, i) { s.hidden = i !== n; });
      bar.style.width = Math.round((n + 1) / steps.length * 100) + '%';
      lab.textContent = 'Question ' + (n + 1) + ' of ' + steps.length;
      $('[data-gf-prev]', gf).hidden = n === 0;
      $('[data-gf-next]', gf).hidden = n === steps.length - 1;
      $('[data-gf-go]', gf).hidden = n !== steps.length - 1;
    }
    gf.addEventListener('click', function (e) {
      if (e.target.closest('[data-gf-next]')) { e.preventDefault(); if (valid()) show(form._step + 1); }
      if (e.target.closest('[data-gf-prev]')) { e.preventDefault(); show(form._step - 1); }
      if (e.target.closest('[data-gf-go]')) { e.preventDefault(); if (valid()) run(); }
      if (e.target.closest('[data-gf-restart]')) { e.preventDefault(); out.innerHTML = ''; form.hidden = false; show(0); }
    });
    form.addEventListener('change', function (e) { if (e.target.type === 'radio' && form._step < steps.length - 1) setTimeout(function () { show(form._step + 1); }, 200); });
    function valid() {
      var s = steps[form._step], r = $$('input[type=radio]', s);
      if (r.length && !r.some(function (x) { return x.checked; })) { O.toast('Pick one option to continue'); return false; }
      return true;
    }
    function val(n) { var x = $('input[name=' + n + ']:checked', form); return x ? x.value : ''; }
    function run() {
      var who = val('who'), cul = val('culture'), occ = val('occasion'), bud = +val('budget') || 2, vibe = val('vibe');
      var cname = CUL[cul] || '';
      var scored = G.map(function (g) {
        var s = 0;
        if (cname && g.cultures.indexOf(cname) > -1) s += 4; else if (g.cultures.indexOf('Pan-Asian') > -1) s += 1; else if (cname) s -= 3;
        if (g.occasions.indexOf(occ) > -1) s += 4;
        if (g.recipients.indexOf(who) > -1) s += 2;
        if (g.budget === bud) s += 2; else if (g.budget < bud) s += 1; else s -= 3 * (g.budget - bud);
        if (vibe && g.vibes.indexOf(vibe) > -1) s += 2;
        return { g: g, s: s };
      }).sort(function (a, b) { return b.s - a.s; }).slice(0, 6);
      O.data('symbols').then(function (S) {
        var avoid = cul ? S.filter(function (x) { return x.verdict[cul] === 'avoid'; }).slice(0, 6) : [];
        form.hidden = true;
        var share = location.href.split('?')[0] + '?who=' + who + '&culture=' + cul + '&occasion=' + occ + '&budget=' + bud + '&vibe=' + vibe;
        out.innerHTML = '<div class="verdict v-ok"><h3>Your top matches</h3><p>For a ' + esc(who) + (cname ? ' with ' + esc(cname) + ' roots' : '') + ', ' + esc($('input[name=occasion]:checked', form).getAttribute('data-label') || occ) + ', budget ' + BUD[bud] + '.</p>' +
          '<p><button type="button" class="chip" data-gf-restart>Start over</button> <button type="button" class="chip" data-copy="' + esc(share) + '">Copy link to these results</button> <a class="chip" href="gift-ideas.html?fav=1">My saved list</a></p></div>' +
          '<div class="grid cards-2" style="margin-top:1rem">' + scored.map(function (x) { return giftCard(x.g); }).join('') + '</div>' +
          (avoid.length ? '<div class="verdict v-no"><h3>Avoid for ' + esc(cname) + '</h3><ul>' + avoid.map(function (a) { return '<li><strong>' + esc(a.term) + ':</strong> ' + esc(a.meaning) + '</li>'; }).join('') + '</ul><p><a href="taboo-checker.html?culture=' + cul + '">Check any other gift idea →</a></p></div>' : '') +
          '<div class="ad-slot" data-slot="tool-result"></div>' +
          O.cta('Buying for a team, clients or wedding guests?', 'Tell us the occasion, quantity and budget. A gifting specialist sends a curated, culturally checked shortlist with suppliers in 48 hours. Free, no obligation.');
        out.scrollIntoView({ behavior: 'smooth' });
        store.set('last_finder', { who: who, cul: cul, occ: occ });
      });
    }
    if (params.get('culture') && params.get('occasion')) {
      ['who', 'culture', 'occasion', 'budget', 'vibe'].forEach(function (k) { var x = $('input[name=' + k + '][value="' + params.get(k) + '"]', form); if (x) x.checked = true; });
      show(steps.length - 1); run();
    } else show(0);
  });

  /* ---------- Gift Ideas catalogue ---------- */
  var gi = $('[data-tool=gift-ideas]');
  if (gi) Promise.all([O.data('gifts'), O.data('occasions')]).then(function (r) {
    var G = r[0], OCC = r[1], list = $('#giList'), cnt = $('#giCount');
    var fCul = $('#fCulture'), fOcc = $('#fOccasion'), fBud = $('#fBudget'), fQ = $('#fQuery'), fFav = $('#fFav');
    Object.keys(OCC).forEach(function (k) { fOcc.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(OCC[k]) + '</option>'); });
    if (params.get('q')) fQ.value = params.get('q');
    if (params.get('fav')) fFav.checked = true;
    if (params.get('occasion')) fOcc.value = params.get('occasion');
    function render() {
      var q = fQ.value.trim().toLowerCase(), c = fCul.value, o = fOcc.value, b = +fBud.value, fv = fFav.checked, F = favs();
      var res = G.filter(function (g) {
        if (c && g.cultures.indexOf(c) === -1 && g.cultures.indexOf('Pan-Asian') === -1) return false;
        if (o && g.occasions.indexOf(o) === -1) return false;
        if (b && g.budget !== b) return false;
        if (fv && F.indexOf(g.name) === -1) return false;
        if (q && (g.name + ' ' + g.why + ' ' + g.cultures.join(' ') + ' ' + g.vibes.join(' ')).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      cnt.textContent = res.length;
      list.innerHTML = res.length ? res.map(function (g, i) { return giftCard(g) + (i === 7 ? '<div class="ad-slot" data-slot="in-content"></div>' : ''); }).join('') : '<div class="empty">No ideas match all filters. Try removing one, or <a href="gift-finder.html">use the Gift Finder</a>.</div>';
    }
    [fCul, fOcc, fBud, fFav].forEach(function (el) { el.addEventListener('change', render); });
    fQ.addEventListener('input', render);
    $('#favCount').textContent = favs().length;
    $('#copyList').addEventListener('click', function () {
      var F = favs(); if (!F.length) { O.toast('Save a few ideas first'); return; }
      navigator.clipboard && navigator.clipboard.writeText('My gift shortlist (OrientalGiftShop.com):\n- ' + F.join('\n- ')).then(function () { O.toast('List copied'); });
    });
    render();
  });

  /* ---------- Taboo Checker ---------- */
  var tc = $('[data-tool=taboo]');
  if (tc) O.data('symbols').then(function (S) {
    var cSel = $('#tcCulture'), inp = $('#tcGift'), out = $('#tcResult');
    if (params.get('culture')) cSel.value = params.get('culture');
    if (params.get('gift')) inp.value = params.get('gift');
    function check() {
      var c = cSel.value, q = inp.value.trim().toLowerCase();
      if (!q) { out.innerHTML = ''; return; }
      var hits = S.filter(function (s) {
        return s.keywords.some(function (k) { k = k.toLowerCase(); return (' ' + q + ' ').indexOf(' ' + k) > -1 || q.indexOf(k) > -1 && k.length > 3; });
      });
      if (/\b4\b|four/.test(q)) hits = hits.concat(S.filter(function (s) { return s.term === 'Number 4' && hits.indexOf(s) === -1; }));
      var cname = CUL[c];
      if (!hits.length) {
        out.innerHTML = '<div class="verdict v-ok"><h3>No known taboo found for "' + esc(inp.value) + '" in ' + esc(cname) + '</h3><p>Still check the basics: avoid sets of four (in China, Japan and Korea), avoid plain white or black wrapping, wrap neatly and give with both hands.</p></div>' + O.cta('Want a culturally checked shortlist?');
        return;
      }
      var worst = 'ok';
      hits.forEach(function (h) { var v = h.verdict[c] || 'ok'; if (v === 'avoid') worst = 'avoid'; else if (v === 'caution' && worst !== 'avoid') worst = 'caution'; });
      var head = { avoid: ['v-no', 'Better to avoid'], caution: ['v-warn', 'Use care'], ok: ['v-ok', 'Looks fine'] }[worst];
      out.innerHTML = '<div class="verdict ' + head[0] + '"><h3>' + head[1] + ': "' + esc(inp.value) + '" in ' + esc(cname) + '</h3>' +
        hits.map(function (h) {
          var v = VERD[h.verdict[c] || 'ok'];
          return '<p><span class="tag ' + v[0] + '">' + v[1] + '</span> <strong>' + esc(h.term) + '.</strong> ' + esc(h.meaning) + (h.notes[c] ? ' <em>' + esc(cname) + ':</em> ' + esc(h.notes[c]) : '') + '</p>';
        }).join('') + '<p class="small">Across cultures: ' + hits.map(function (h) { return Object.keys(CUL).map(function (k) { var v = VERD[h.verdict[k] || 'ok']; return '<span class="tag ' + v[0] + '">' + CUL[k] + ': ' + v[1] + '</span>'; }).join(''); }).join('<br>') + '</p></div>' +
        '<div class="ad-slot" data-slot="tool-result"></div>';
    }
    $('#tcForm').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    cSel.addEventListener('change', check);
    $$('[data-try]', tc).forEach(function (b) { b.addEventListener('click', function () { inp.value = b.getAttribute('data-try'); check(); }); });
    if (inp.value) check();
  });

  /* ---------- Symbolism dictionary ---------- */
  var sd = $('[data-tool=symbols]');
  if (sd) O.data('symbols').then(function (S) {
    var q = $('#sdQuery'), list = $('#sdList'), type = 'all';
    function render() {
      var t = q.value.trim().toLowerCase();
      var res = S.filter(function (s) { return (type === 'all' || s.type === type) && (!t || (s.term + ' ' + s.meaning + ' ' + s.keywords.join(' ')).toLowerCase().indexOf(t) > -1); });
      list.innerHTML = res.length ? res.map(function (s) {
        return '<article class="result-card" id="' + esc(s.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '"><p class="eyebrow">' + esc(s.type) + '</p><h3>' + esc(s.term) + '</h3><p>' + esc(s.meaning) + '</p><p>' +
          Object.keys(CUL).map(function (k) { var v = VERD[s.verdict[k] || 'ok']; return '<span class="tag ' + v[0] + '" title="' + esc(s.notes[k] || '') + '">' + CUL[k] + ': ' + v[1] + '</span>'; }).join('') + '</p>' +
          (Object.keys(s.notes).length ? '<ul class="small">' + Object.keys(s.notes).map(function (k) { return '<li><strong>' + CUL[k] + ':</strong> ' + esc(s.notes[k]) + '</li>'; }).join('') + '</ul>' : '') + '</article>';
      }).join('') : '<div class="empty">Nothing found. Try "red", "4" or "crane".</div>';
    }
    q.addEventListener('input', render);
    $$('[data-type]', sd).forEach(function (b) { b.addEventListener('click', function () { type = b.getAttribute('data-type'); $$('[data-type]', sd).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }); });
    if (params.get('q')) q.value = params.get('q');
    render();
  });

  /* ---------- Lucky Amount Calculator ---------- */
  var la = $('[data-tool=lucky]');
  if (la) {
    var RULES = {
      cn: { happy: function (n) { return n % 2 === 0 && !/4/.test(String(n)); }, sad: function (n) { return n % 2 === 1 && !/4/.test(String(n)); },
        tipH: 'Use even amounts in crisp new notes, avoid any 4, and favour 6 (smooth), 8 (prosperity) and 9 (long-lasting). Red envelope, both hands.',
        tipS: 'For funerals (帛金 / 白金) use an odd amount in a white envelope, often with an extra coin; avoid new notes.' },
      vn: { happy: function (n) { return !/4/.test(String(n)); }, sad: function (n) { return n % 2 === 1; },
        tipH: 'Lì xì uses new notes in red or gold envelopes. Avoid 4; amounts containing 8 or 9 are popular. The gesture matters more than the sum.',
        tipS: 'Funeral contributions use a white envelope; odd amounts are customary in many families.' },
      kr: { happy: function (n) { var d = lead(n); return isRoundLead(n) && (d % 2 === 1 || isTenUnit(n)) && d !== 9; }, sad: function (n) { var d = lead(n); return isRoundLead(n) && d % 2 === 1; },
        tipH: 'Korean wedding and celebration money (축의금) is usually an odd number of units, like 50,000 or 100,000 won, in a white envelope marked 축 결혼 (wedding) or 축 생일 (birthday). Avoid 4; new notes are nicest.',
        tipS: 'Condolence money (부의금) also uses odd units, in a white envelope marked 부의 or 근조.' },
      jp: { happy: function (n) { var d = lead(n); return (d === 1 || d === 3 || d === 5 || d === 7) && isRoundLead(n); }, sad: function (n) { var d = lead(n); return (d === 1 || d === 3 || d === 5) && isRoundLead(n); },
        tipH: 'Japanese goshugi uses an odd leading digit (10,000 / 30,000 / 50,000 yen; 20,000 is sometimes acceptable as a "pair"). Never 4 or 9. Use brand-new notes in a shūgi-bukuro with a knot that cannot be untied (musubi-kiri) for weddings.',
        tipS: 'Kōden (condolence money) uses an odd leading digit and slightly used notes, in a black-and-white envelope. Never brand-new notes.' },
      in: { happy: function (n) { return n % 10 === 1; }, sad: function (n) { return n % 10 === 0; },
        tipH: 'Shagun ends in 1: 101, 251, 501, 1,001, 2,001 and so on (larger gifts are also given as 1,100, 2,100 or 11,000). The extra one means the blessing keeps growing. Many envelopes come with the coin attached.',
        tipS: 'Cash at Hindu funerals is not universal. Where given (for example to support the family), round amounts without the added 1 are used.' }
    };
    function lead(n) { return +String(n)[0]; }
    function isTenUnit(n) { return /^10+$/.test(String(n)); }
    function isRoundLead(n) { return /^[1-9]0*$/.test(String(n)); }
    var form = $('#laForm'), out = $('#laResult');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = $('#laCulture').value, occ = $('#laOccasion').value, T = Math.max(1, Math.round(+$('#laAmount').value || 0)), cur = $('#laCurrency').value;
      var R = RULES[c], ok = occ === 'funeral' ? R.sad : R.happy;
      var cands = [];
      var mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(T)) - 1));
      if (c === 'in' && occ !== 'funeral') {
        cands = [11, 21, 31, 51, 101, 151, 201, 251, 301, 501, 701, 1001, 1101, 1501, 2001, 2101, 2501, 5001, 5101, 11001, 21001, 51001, 100001].slice();
      } else {
        var step = (c === 'cn' || c === 'vn') ? Math.max(1, mag / 10) : mag;
        for (var n = Math.max(1, Math.floor(T * 0.5 / step) * step); n <= T * 1.8; n += step) if (ok(n)) cands.push(n);
        if (c === 'jp' || c === 'kr') { [1, 3, 5, 7].forEach(function (d) { var k = Math.pow(10, Math.floor(Math.log10(T))); [k, k * 10].forEach(function (m) { var v = d * m; if (v >= T * 0.3 && v <= T * 3 && ok(v)) cands.push(v); }); }); }
      }
      cands = cands.filter(function (v, i, a) { return v > 0 && ok(v) && a.indexOf(v) === i; });
      function luck(v) { var s = String(v), b = 0; if (c === 'cn' || c === 'vn') { b += (s.match(/8/g) || []).length * 0.2 + (s.match(/6|9/g) || []).length * 0.1 - s.replace(/0+$/, '').length * 0.03; } return b; }
      cands.sort(function (a, b) { return (Math.abs(a - T) / T - luck(a)) - (Math.abs(b - T) / T - luck(b)); });
      var top = cands.slice(0, 5).sort(function (a, b) { return a - b; });
      out.innerHTML = '<div class="verdict ' + (occ === 'funeral' ? 'v-warn' : 'v-ok') + '"><h3>Suggested amounts near ' + cur + T.toLocaleString() + '</h3>' +
        '<div class="grid cards-4" style="margin:1rem 0">' + top.map(function (v) { return '<div class="result-card" style="text-align:center"><div class="big-num">' + cur + v.toLocaleString() + '</div><button type="button" class="chip" style="margin-top:.6rem" data-copy="' + cur + v.toLocaleString() + '">Copy</button></div>'; }).join('') + '</div>' +
        '<p>' + esc(occ === 'funeral' ? R.tipS : R.tipH) + '</p><p class="small">Amounts are customs, not rules. Families and regions differ; when in doubt, ask a relative or match what others in the family give.</p></div>' +
        '<p><a href="guides/red-envelope-guide.html">Read the full red envelope &amp; cash gift guide →</a></p><div class="ad-slot" data-slot="tool-result"></div>';
    });
  }

  /* ---------- Zodiac Gift Matcher ---------- */
  var zd = $('[data-tool=zodiac]');
  if (zd) {
    var Z = [
      ['Rat', '鼠', 'Quick-witted, resourceful, sociable', 'gold, blue, green', '2, 3', ['A smart gadget or organiser', 'A premium cheese or snack hamper', 'A strategy board game such as Go or mahjong', 'A classic leather-free wallet with a lucky coin inside']],
      ['Ox', '牛', 'Diligent, dependable, patient', 'white, yellow, green', '1, 4', ['A well-made work bag or quality tool kit', 'A wool blanket or comfortable slippers', 'A bonsai or gardening kit', 'A hearty gourmet food basket']],
      ['Tiger', '虎', 'Brave, confident, competitive', 'blue, grey, orange', '1, 3, 4', ['An adventure experience or class', 'Fitness gear or a smartwatch', 'Bold statement jewellery', 'A travel accessory set']],
      ['Rabbit', '兔', 'Gentle, elegant, kind', 'red, pink, purple, blue', '3, 4, 6', ['A silk scarf or soft cashmere', 'A beautiful tea set', 'Scented candles or incense', 'Botanical art prints']],
      ['Dragon', '龙', 'Ambitious, charismatic, energetic', 'gold, silver, grey', '1, 6, 7', ['A luxury pen or desk piece', 'Fine jewellery or a watch (not for traditional Chinese elders)', 'A premium whisky or sake', 'A VIP experience']],
      ['Snake', '蛇', 'Wise, intuitive, refined', 'black, red, yellow', '2, 8, 9', ['Books and journals', 'A jade or gemstone pendant', 'A meditation or spa kit', 'Designer accessories']],
      ['Horse', '马', 'Free-spirited, active, warm', 'yellow, green', '2, 3, 7', ['Travel gear or luggage', 'Running or outdoor gear', 'Concert or event tickets', 'A road-trip snack and playlist bundle']],
      ['Goat', '羊', 'Creative, calm, compassionate', 'brown, red, purple', '3, 4, 9', ['Art supplies or a pottery class', 'A cosy wool throw', 'A houseplant collection', 'Handmade ceramics']],
      ['Monkey', '猴', 'Clever, curious, playful', 'white, blue, gold', '1, 7, 8', ['Puzzles and brain teasers', 'A new tech gadget', 'A cooking or mixology class', 'A fun snack subscription box']],
      ['Rooster', '鸡', 'Observant, hardworking, proud', 'gold, brown, yellow', '5, 7, 8', ['A grooming or skincare set', 'A well-made planner', 'Stylish clothing accessories', 'A gourmet breakfast hamper']],
      ['Dog', '狗', 'Loyal, honest, protective', 'red, green, purple', '3, 4, 9', ['A personalised keepsake', 'Something for their pet', 'Outdoor or hiking gear', 'A framed photo or memory book']],
      ['Pig', '猪', 'Generous, easy-going, warm-hearted', 'yellow, grey, brown', '2, 5, 8', ['A luxury food hamper', 'A spa or massage voucher', 'Comfortable loungewear', 'A home entertaining set']]
    ];
    // Lunar New Year dates (month-day) for boundary checks, 1930–2035
    var LNY = { 1930: '01-30', 1931: '02-17', 1932: '02-06', 1933: '01-26', 1934: '02-14', 1935: '02-04', 1936: '01-24', 1937: '02-11', 1938: '01-31', 1939: '02-19', 1940: '02-08', 1941: '01-27', 1942: '02-15', 1943: '02-05', 1944: '01-25', 1945: '02-13', 1946: '02-02', 1947: '01-22', 1948: '02-10', 1949: '01-29', 1950: '02-17', 1951: '02-06', 1952: '01-27', 1953: '02-14', 1954: '02-03', 1955: '01-24', 1956: '02-12', 1957: '01-31', 1958: '02-18', 1959: '02-08', 1960: '01-28', 1961: '02-15', 1962: '02-05', 1963: '01-25', 1964: '02-13', 1965: '02-02', 1966: '01-21', 1967: '02-09', 1968: '01-30', 1969: '02-17', 1970: '02-06', 1971: '01-27', 1972: '02-15', 1973: '02-03', 1974: '01-23', 1975: '02-11', 1976: '01-31', 1977: '02-18', 1978: '02-07', 1979: '01-28', 1980: '02-16', 1981: '02-05', 1982: '01-25', 1983: '02-13', 1984: '02-02', 1985: '02-20', 1986: '02-09', 1987: '01-29', 1988: '02-17', 1989: '02-06', 1990: '01-27', 1991: '02-15', 1992: '02-04', 1993: '01-23', 1994: '02-10', 1995: '01-31', 1996: '02-19', 1997: '02-07', 1998: '01-28', 1999: '02-16', 2000: '02-05', 2001: '01-24', 2002: '02-12', 2003: '02-01', 2004: '01-22', 2005: '02-09', 2006: '01-29', 2007: '02-18', 2008: '02-07', 2009: '01-26', 2010: '02-14', 2011: '02-03', 2012: '01-23', 2013: '02-10', 2014: '01-31', 2015: '02-19', 2016: '02-08', 2017: '01-28', 2018: '02-16', 2019: '02-05', 2020: '01-25', 2021: '02-12', 2022: '02-01', 2023: '01-22', 2024: '02-10', 2025: '01-29', 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13', 2030: '02-03', 2031: '01-23', 2032: '02-11', 2033: '01-31', 2034: '02-19', 2035: '02-08' };
    var ELEM = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];
    var grid = $('#zGrid'), out = $('#zResult');
    grid.innerHTML = Z.map(function (z, i) { return '<button type="button" class="z-btn" data-z="' + i + '" aria-pressed="false"><b>' + z[1] + '</b>' + z[0] + '</button>'; }).join('');
    function show(i, note) {
      var z = Z[i];
      $$('.z-btn', grid).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-z') === i)); });
      var years = []; for (var y = 1936; y <= 2031; y++) if ((y - 4) % 12 === i) years.push(y);
      out.innerHTML = '<div class="verdict v-ok"><p class="eyebrow">' + esc(note || 'Zodiac profile') + '</p><h3>Year of the ' + z[0] + ' ' + z[1] + '</h3><p><strong>Traits (folk tradition):</strong> ' + z[2] + '.</p><p><strong>Lucky colours:</strong> ' + z[3] + ' · <strong>Lucky numbers:</strong> ' + z[4] + '</p><p class="small">Years: ' + years.join(', ') + ' (each starts at Lunar New Year, not January 1).</p>' +
        '<h3>Gift ideas</h3><ul>' + z[5].map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul><p><a class="btn btn-ghost btn-sm" href="gift-ideas.html?q=zodiac">Zodiac keepsakes</a> <a class="btn btn-ghost btn-sm" href="gift-finder.html">Personalise with the Gift Finder</a></p></div>' +
        '<p class="small">Zodiac traits are cultural folklore shared for fun and gift inspiration, not predictions.</p>';
    }
    grid.addEventListener('click', function (e) { var b = e.target.closest('[data-z]'); if (b) show(+b.getAttribute('data-z')); });
    $('#zForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#zDate').value; if (!v) return;
      var d = new Date(v + 'T00:00:00'), y = d.getFullYear(), md = v.slice(5), note = '';
      if (LNY[y] && md < LNY[y]) { y -= 1; note = 'Born before Lunar New Year (' + LNY[y + 1].replace('-', '/') + '), so you belong to the previous year\'s sign'; }
      else if (!LNY[y]) note = 'Approximate: we only have exact New Year dates for 1930–2035';
      var i = ((y - 4) % 12 + 12) % 12, el = ELEM[((y % 10) + 10) % 10];
      show(i, (note ? note + ' · ' : '') + el + ' ' + Z[i][0]);
    });
    var nd = new Date(), cy = nd.getFullYear(), mdNow = ('0' + (nd.getMonth() + 1)).slice(-2) + '-' + ('0' + nd.getDate()).slice(-2); var ny = (LNY[cy] && mdNow < LNY[cy]) ? cy : cy + 1, ni = ((ny - 4) % 12 + 12) % 12;
    var cyEl = $('#zNow'); if (cyEl) cyEl.innerHTML = 'The next Lunar New Year (' + ny + ') opens the <strong>Year of the ' + Z[ni][0] + ' ' + Z[ni][1] + '</strong> (' + ELEM[ny % 10] + ' ' + Z[ni][0] + ').';
    show(ni, 'Coming year');
  }

  /* ---------- Festival calendar ---------- */
  var fc = $('[data-tool=festivals]');
  if (fc) O.data('festivals').then(function (F) {
    var list = $('#fcList'), now = new Date(), sel = 'all';
    function ics(f, d) {
      var ds = d.toISOString().slice(0, 10).replace(/-/g, '');
      var rem = new Date(d.getTime() - 14 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
      var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//OrientalGiftShop.com//Gift Calendar//EN', 'BEGIN:VEVENT', 'UID:' + f.id + ds + '@orientalgiftshop.com', 'DTSTAMP:' + ds + 'T000000Z', 'DTSTART;VALUE=DATE:' + ds, 'SUMMARY:' + f.name, 'DESCRIPTION:Gift ideas: ' + f.gift.replace(/,/g, '\\,') + ' https://orientalgiftshop.com/' + (f.guide || 'festivals.html'), 'BEGIN:VALARM', 'TRIGGER:-P14D', 'ACTION:DISPLAY', 'DESCRIPTION:Order gifts for ' + f.name, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(txt);
    }
    function render() {
      var up = O.upcoming(F, now).filter(function (o) { return o.date - now < 400 * 864e5 && (sel === 'all' || o.f.region.indexOf(sel) > -1); });
      list.innerHTML = up.map(function (o) {
        var days = Math.ceil((o.date - now) / 864e5), f = o.f;
        return '<article class="fest"><div class="fest-date"><b>' + o.date.getDate() + '</b><span>' + o.date.toLocaleString('en-US', { month: 'short' }) + ' ' + o.date.getFullYear() + '</span></div><div><h3>' + esc(f.name) + '</h3><p class="small">' + esc(f.region) + '</p><p><strong>Give:</strong> ' + esc(f.gift) + '</p><p><strong>Avoid:</strong> ' + esc(f.avoid) + '</p><p style="margin-top:.4rem"><a href="' + esc(f.guide) + '">Gift guide</a> · <a href="' + ics(f, o.date) + '" download="' + f.id + '.ics">Add to calendar (with 2-week reminder)</a></p></div><div class="days">' + (days > 0 ? days + ' days' : 'Now') + '</div></article>';
      }).join('') || '<div class="empty">No festivals for this region in the next year.</div>';
    }
    $$('[data-region]', fc).forEach(function (b) { b.addEventListener('click', function () { sel = b.getAttribute('data-region'); $$('[data-region]', fc).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }); });
    render();
  });

  /* ---------- Greetings phrasebook ---------- */
  var gp = $('[data-tool=greetings]');
  if (gp) {
    var P = [
      ['Lunar New Year', 'Mandarin', '新年快乐', 'Xīnnián kuàilè', 'Happy New Year'],
      ['Lunar New Year', 'Mandarin', '恭喜发财', 'Gōngxǐ fācái', 'Wishing you prosperity'],
      ['Lunar New Year', 'Cantonese', '恭喜發財', 'Gung hei fat choi', 'Wishing you prosperity'],
      ['Lunar New Year', 'Mandarin', '万事如意', 'Wànshì rúyì', 'May everything go as you wish'],
      ['Lunar New Year', 'Mandarin', '身体健康', 'Shēntǐ jiànkāng', 'Wishing you good health (great for elders)'],
      ['Lunar New Year', 'Korean', '새해 복 많이 받으세요', 'Saehae bok mani badeuseyo', 'Receive many blessings in the new year'],
      ['Lunar New Year', 'Vietnamese', 'Chúc mừng năm mới', 'Chook mung nam moy', 'Happy New Year'],
      ['New Year (Jan 1)', 'Japanese', 'あけましておめでとうございます', 'Akemashite omedetō gozaimasu', 'Happy New Year (say it from January 1)'],
      ['Diwali', 'Hindi', 'शुभ दीपावली', 'Shubh Deepavali', 'Auspicious Diwali'],
      ['Diwali', 'Hindi', 'दीपावली की हार्दिक शुभकामनाएं', 'Deepavali ki hardik shubhkamnayein', 'Heartfelt Diwali wishes'],
      ['Mid-Autumn', 'Mandarin', '中秋节快乐', 'Zhōngqiū jié kuàilè', 'Happy Mid-Autumn Festival'],
      ['Mid-Autumn', 'Mandarin', '花好月圆', 'Huā hǎo yuè yuán', 'Blooming flowers and a full moon (togetherness)'],
      ['Chuseok', 'Korean', '즐거운 추석 보내세요', 'Jeulgeoun Chuseok bonaeseyo', 'Have a joyful Chuseok'],
      ['Chuseok', 'Korean', '풍성한 한가위 보내세요', 'Pungseonghan Hangawi bonaeseyo', 'Wishing you a bountiful Hangawi'],
      ['Wedding', 'Mandarin', '百年好合', 'Bǎinián hǎo hé', 'A harmonious union for a hundred years'],
      ['Wedding', 'Mandarin', '早生贵子', 'Zǎo shēng guì zǐ', 'May you soon have a precious child (traditional; use with care)'],
      ['Wedding', 'Japanese', 'ご結婚おめでとうございます', 'Go-kekkon omedetō gozaimasu', 'Congratulations on your marriage'],
      ['Wedding', 'Korean', '결혼 축하합니다', 'Gyeolhon chukahamnida', 'Congratulations on your wedding'],
      ['Birthday', 'Mandarin', '生日快乐', 'Shēngrì kuàilè', 'Happy birthday'],
      ['Birthday', 'Mandarin', '福如东海，寿比南山', 'Fú rú dōnghǎi, shòu bǐ nánshān', 'Fortune as vast as the East Sea, life as long as the Southern Mountains (for elders)'],
      ['Birthday', 'Japanese', 'お誕生日おめでとうございます', 'O-tanjōbi omedetō gozaimasu', 'Happy birthday (polite)'],
      ['Birthday', 'Korean', '생일 축하합니다', 'Saengil chukahamnida', 'Happy birthday (polite)'],
      ['Thank you', 'Japanese', 'いつもお世話になっております', 'Itsumo o-sewa ni natte orimasu', 'Thank you for your continued support (business)'],
      ['Thank you', 'Mandarin', '感谢您的照顾', 'Gǎnxiè nín de zhàogù', 'Thank you for looking after me'],
      ['Eid', 'Arabic / Urdu / Malay', 'عيد مبارك', 'Eid Mubarak', 'Blessed Eid'],
      ['Eid', 'Malay', 'Selamat Hari Raya', 'Selamat Hari Raya', 'Happy Hari Raya'],
      ['Songkran', 'Thai', 'สุขสันต์วันสงกรานต์', 'Suk san wan Songkran', 'Happy Songkran'],
      ['Dragon Boat', 'Mandarin', '端午安康', 'Duānwǔ ānkāng', 'Peace and health this Duanwu']
    ];
    var occs = []; P.forEach(function (p) { if (occs.indexOf(p[0]) === -1) occs.push(p[0]); });
    var chips = $('#gpChips'), list = $('#gpList'), cur = 'all';
    chips.innerHTML = '<button type="button" class="chip" aria-pressed="true" data-o="all">All</button>' + occs.map(function (o) { return '<button type="button" class="chip" aria-pressed="false" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('');
    function render() {
      list.innerHTML = P.filter(function (p) { return cur === 'all' || p[0] === cur; }).map(function (p) {
        return '<article class="result-card phrase"><div><p class="eyebrow">' + esc(p[0]) + ' · ' + esc(p[1]) + '</p><div class="native" lang="' + ({ Mandarin: 'zh-Hans', Cantonese: 'zh-Hant', Korean: 'ko', Japanese: 'ja', Hindi: 'hi', Vietnamese: 'vi', Thai: 'th', Malay: 'ms' }[p[1]] || 'ar') + '">' + esc(p[2]) + '</div><div class="rom">' + esc(p[3]) + '</div><div class="en">' + esc(p[4]) + '</div></div><button type="button" class="chip" data-copy="' + esc(p[2]) + '">Copy</button></article>';
      }).join('');
    }
    chips.addEventListener('click', function (e) { var b = e.target.closest('[data-o]'); if (!b) return; cur = b.getAttribute('data-o'); $$('[data-o]', chips).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); });
    render();
  }
})();
