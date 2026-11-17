/* OrientalGiftShop.com page enhancements: guide table of contents, in-guide lead CTA and ad slot, FAQ structured data. */
(function () {
  'use strict';
  var doc = document;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var prose = doc.querySelector('.guide .prose');
  if (prose) {
    var hs = Array.prototype.slice.call(prose.querySelectorAll('h2'));
    var toc = doc.getElementById('toc');
    hs.forEach(function (h, i) {
      if (!h.id) h.id = 's' + (i + 1) + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (toc) toc.insertAdjacentHTML('beforeend', '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>');
    });
    var topic = prose.getAttribute('data-lead') || 'gifts';
    if (hs[2]) hs[2].insertAdjacentHTML('beforebegin', '<aside class="lead-cta lead-inline"><div><p class="eyebrow">Free Gift Concierge</p><h3>Buying ' + esc(topic) + ' for 10 or more people?</h3><p>Tell us the occasion, budget and deadline. We send a curated, culturally checked shortlist with supplier options within 48 hours. Free, no obligation.</p></div><a class="btn btn-red" href="concierge.html?src=guide">Get my free proposal</a></aside>');
    if (hs[4]) hs[4].insertAdjacentHTML('beforebegin', '<div class="ad-slot" data-slot="in-content" aria-label="Advertisement"></div>');
    Array.prototype.slice.call(prose.querySelectorAll('table')).forEach(function (t) {
      var w = doc.createElement('div'); w.className = 'tbl-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }
  var faqs = Array.prototype.slice.call(doc.querySelectorAll('details.faq'));
  if (faqs.length) {
    var ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(function (d) {
      var q = d.querySelector('summary').textContent.trim();
      var a = d.textContent.replace(d.querySelector('summary').textContent, '').replace(/\s+/g, ' ').trim();
      return { '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } };
    }) };
    var s = doc.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); doc.head.appendChild(s);
  }
})();
