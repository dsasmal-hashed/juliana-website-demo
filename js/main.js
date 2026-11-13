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
})();
