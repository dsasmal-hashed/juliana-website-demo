// Juliana website: mobile menu, header state, scroll reveals, active nav link, contact form.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Mobile menu
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Logo returns to the top of the home page (a sticky header can't be a scroll target)
  var brand = document.querySelector('.brand');
  if (brand && brand.getAttribute('href') === '#') {
    brand.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
    });
  }

  // Review mode: open the page with #review to highlight placeholders still to confirm
  function checkReview() {
    if (location.hash !== '#review' || document.documentElement.classList.contains('review')) return;
    document.documentElement.classList.add('review');
    var b = document.createElement('div');
    b.className = 'review-banner';
    b.textContent = 'Review mode: ' + document.querySelectorAll('.tbc').length + ' placeholders highlighted';
    document.body.appendChild(b);
  }
  checkReview();
  window.addEventListener('hashchange', checkReview);

  // Header border once the page scrolls
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll; everything shows at once if IntersectionObserver is unavailable
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Home hero panel: about 1,000 enrolled patients, about 20 in the unit on a given day
  var panel = document.getElementById('panel');
  if (panel) {
    var NS = 'http://www.w3.org/2000/svg', cols = 40, total = 1000, admitted = 20, gap = 12, r = 3.6;
    var seed = 11, lit = {}, count = 0, frag = document.createDocumentFragment();
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    while (count < admitted) { var k = Math.floor(rnd() * total); if (!lit[k]) { lit[k] = 1; count++; } }
    for (var i = 0; i < total; i++) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', 11 + (i % cols) * gap);
      c.setAttribute('cy', 11 + Math.floor(i / cols) * gap);
      c.setAttribute('r', lit[i] ? r + 2 : r);
      c.style.fill = lit[i] ? 'var(--navy)' : 'var(--border)';
      frag.appendChild(c);
    }
    panel.appendChild(frag);
  }

  // Highlight the nav link for the section in view
  var links = document.querySelectorAll('.nav-links a');
  // Only same-page links (#id) take part; links to other pages keep their own state
  links = Array.prototype.filter.call(links, function (a) { return a.getAttribute('href').charAt(0) === '#'; });
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  // Contact form: posts to the form service in data-endpoint; until one is set, opens a pre-filled email
  var form = document.getElementById('contact-form');
  if (form) {
    var done = document.getElementById('form-done');
    var msg = document.getElementById('done-msg');
    var copyBtn = document.getElementById('copy-details');
    var to = 'connect@juliana.care';
    var details = '';
    var submitLabel = document.getElementById('submit-label');
    var labels = { conversation: 'Schedule a conversation', snapshot: 'Request your snapshot' };

    function intent() { var c = form.querySelector('input[name="intent"]:checked'); return c ? c.value : 'conversation'; }
    function setIntent(v) {
      var r = form.querySelector('input[name="intent"][value="' + v + '"]');
      if (r) r.checked = true;
      submitLabel.textContent = labels[v] || labels.conversation;
      document.querySelectorAll('[data-show]').forEach(function (el) { el.hidden = el.getAttribute('data-show') !== v; });
    }
    form.addEventListener('change', function (e) { if (e.target.name === 'intent') setIntent(e.target.value); });
    document.querySelectorAll('[data-intent]').forEach(function (a) {
      a.addEventListener('click', function () { setIntent(a.getAttribute('data-intent')); });
    });

    function finish(first, sent) {
      var what = intent() === 'snapshot' ? 'to walk you through your opportunity snapshot' : 'to arrange a first conversation';
      msg.innerHTML = sent
        ? '<strong>Thank you' + first + '.</strong> Our team will be in touch ' + what + '.'
        : '<strong>Thank you' + first + '.</strong> Your email app should open with these details addressed to our team, who will be in touch ' + what + '. If it does not open, copy the details and send them to <strong>' + to + '</strong>.';
      copyBtn.hidden = sent;
      done.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var first = ', ' + String(d.get('name')).trim().split(' ')[0];
      var ask = intent() === 'snapshot' ? 'Opportunity snapshot' : 'First conversation';
      details = 'Request: ' + ask + '\nName: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nHospital or health system: ' + d.get('org') +
        (d.get('role') ? '\nRole: ' + d.get('role') : '') + (d.get('message') ? '\n\n' + d.get('message') : '');
      var mailto = 'mailto:' + to + '?subject=' + encodeURIComponent(ask + ': ' + d.get('org')) + '&body=' + encodeURIComponent(details);
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); finish(first, true); })
          .catch(function () { window.location.href = mailto; finish(first, false); });
      } else {
        window.location.href = mailto;
        finish(first, false);
      }
    });

    copyBtn.addEventListener('click', function () {
      function copied() { copyBtn.textContent = 'Copied'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(details).then(copied, function () { copyBtn.textContent = 'Copy not available'; });
      } else {
        copyBtn.textContent = 'Copy not available';
      }
    });
  }

  // A case reached by a link opens its full story, so the visitor never needs a second click
  function openLinkedCase() {
    var id = location.hash.slice(1);
    if (!/^case-\d+$/.test(id)) return;
    var more = document.querySelector('#' + id + ' .case-more');
    if (more) more.open = true;
  }
  openLinkedCase();
  window.addEventListener('hashchange', openLinkedCase);
  document.querySelectorAll('a[href^="#case-"]').forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(openLinkedCase, 0); });
  });

  // Detail pages: the "On this page" index follows as a slim bar once the hero scrolls away,
  // and marks the section being read
  var jump = document.querySelector('.jump');
  if (jump) {
    var bar = document.createElement('nav');
    bar.className = 'subnav';
    bar.setAttribute('aria-label', 'On this page, sections');
    var row = document.createElement('div');
    row.className = 'container';
    var barLinks = [];
    jump.querySelectorAll('a').forEach(function (a) {
      var c = a.cloneNode(true);
      c.tabIndex = -1;
      row.appendChild(c);
      barLinks.push(c);
    });
    bar.appendChild(row);
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    document.documentElement.classList.add('has-subnav');
    var sections = barLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var current = -1;

    function updateBar() {
      var show = jump.getBoundingClientRect().bottom < 76;
      if (bar.classList.contains('is-visible') !== show) {
        bar.classList.toggle('is-visible', show);
        bar.setAttribute('aria-hidden', String(!show));
        barLinks.forEach(function (a) { a.tabIndex = show ? 0 : -1; });
      }
      var active = -1;
      sections.forEach(function (sec, k) { if (sec && sec.getBoundingClientRect().top <= 150) active = k; });
      if (active !== current) {
        current = active;
        barLinks.forEach(function (a, k) {
          a.classList.toggle('is-active', k === active);
          if (k === active) { a.setAttribute('aria-current', 'location'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
          else a.removeAttribute('aria-current');
        });
      }
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; updateBar(); });
    }, { passive: true });
    updateBar();
  }

  // Team profiles: a slide-in panel with background, highlights and LinkedIn (about page only)
  var sheet = document.getElementById('profile');
  var dataEl = document.getElementById('people-data');
  if (sheet && dataEl) {
    var people = JSON.parse(dataEl.textContent).filter(function (p) { return !p.hidden; });  // hidden people stay in the data but never show
    var current = -1;
    var opener = null;
    var $ = function (id) { return document.getElementById(id); };

    function render(i) {
      var p = people[i];
      current = i;
      $('profile-tier').textContent = p.tier;
      $('profile-photo').innerHTML = p.photo
        ? '<img src="assets/team/' + p.photo + '" alt="' + p.name.replace(/"/g, '') + '" width="600" height="600">'
        : '<span class="initials tbc" aria-hidden="true">' + p.initials + '</span>';
      $('profile-name').innerHTML = p.name;
      $('profile-title').innerHTML = p.title;
      $('profile-focus').innerHTML = p.focus;
      $('profile-bio').innerHTML = p.bio;
      // Placeholder copy shows only in review mode
      var reviewing = document.documentElement.classList.contains('review');
      [$('profile-focus'), $('profile-bio')].forEach(function (el) {
        var onlyPlaceholder = el.querySelector('.ph') && !el.textContent.replace(/\[[^\]]*\]/g, '').trim();
        el.hidden = onlyPlaceholder && !reviewing;
        var label = el.previousElementSibling;
        if (label && label.classList.contains('profile-label')) label.hidden = el.hidden;
      });
      $('profile-tags').innerHTML = p.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join('');
      $('profile-li').innerHTML = p.linkedin
        ? '<a href="' + p.linkedin + '" target="_blank" rel="noopener" aria-label="' + p.name.replace(/"/g, '') + ' on LinkedIn"><svg><use href="#i-linkedin"/></svg></a>'
        : '';
      try { history.replaceState(null, '', '#' + p.slug); } catch (err) {}
    }

    function openProfile(i) {
      render(i);
      if (!sheet.open) {
        sheet.showModal();
        document.body.classList.add('sheet-open');
      }
      $('profile-close').focus();
    }

    function closeProfile() {
      if (sheet.open) sheet.close();
    }

    sheet.addEventListener('close', function () {
      document.body.classList.remove('sheet-open');
      try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
      if (opener) opener.focus();
    });
    sheet.addEventListener('click', function (e) { if (e.target === sheet) closeProfile(); });
    $('profile-close').addEventListener('click', closeProfile);
    $('profile-prev').addEventListener('click', function () { render((current - 1 + people.length) % people.length); });
    $('profile-next').addEventListener('click', function () { render((current + 1) % people.length); });

    document.querySelectorAll('[data-person]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var slug = btn.getAttribute('data-person');
        for (var i = 0; i < people.length; i++) if (people[i].slug === slug) return openProfile(i);
      });
    });

    function fromHash() {
      var slug = location.hash.slice(1);
      for (var i = 0; i < people.length; i++) if (people[i].slug === slug) return openProfile(i);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }
})();
