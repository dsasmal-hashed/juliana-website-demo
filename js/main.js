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

  // Contact form: shows a confirmation with the details ready to copy (no server yet)
  var form = document.getElementById('contact-form');
  if (form) {
    var done = document.getElementById('form-done');
    var details = '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      details = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nHospital or health system: ' + d.get('org') +
        (d.get('message') ? '\n\n' + d.get('message') : '');
      document.getElementById('done-name').textContent = ', ' + String(d.get('name')).split(' ')[0];
      done.hidden = false;
    });
    var copyBtn = document.getElementById('copy-details');
    copyBtn.addEventListener('click', function () {
      function copied() { copyBtn.textContent = 'Copied'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(details).then(copied, function () { copyBtn.textContent = 'Copy not available'; });
      } else {
        copyBtn.textContent = 'Copy not available';
      }
    });
  }

  // Team profiles: a slide-in panel with background, highlights and LinkedIn (about page only)
  var sheet = document.getElementById('profile');
  var dataEl = document.getElementById('people-data');
  if (sheet && dataEl) {
    var people = JSON.parse(dataEl.textContent);
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
