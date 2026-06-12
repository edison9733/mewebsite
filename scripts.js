/* ============================================================
   Edison Liu — Portfolio
   Minimal vanilla JS. No dependencies, no build step.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Nav: solidify on scroll ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('navMobile');

  function closeMenu() {
    toggle.classList.remove('is-open');
    mobile.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = mobile.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  // Close mobile menu when a link is tapped
  mobile.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Scroll reveal (IntersectionObserver) ----------
     Content is visible by default (see CSS). We only arm the hidden
     state if JS is running AND the user hasn't asked for reduced motion.
  ------------------------------------------------------------ */
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');

  if (!reduceMotion && 'IntersectionObserver' in window && reveals.length) {
    // Arm the hidden state now that we know reveals will be driven by JS.
    document.documentElement.classList.add('reveal-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });

    // Safety net: reveal anything already in the viewport on load
    // (covers the hero / above-the-fold so it's never stuck hidden).
    requestAnimationFrame(function () {
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    });
  }
  // If reduced-motion or no IO: do nothing — CSS leaves content visible.

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Contact form ----------
     No backend yet. This opens the user's mail client pre-filled.
     To collect submissions properly, swap this for a Formspree / Getform
     endpoint, or wire your own backend. See the note in index.html.
  ------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('cfNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements['name'].value.trim();
      var email = form.elements['email'].value.trim();
      var subject = form.elements['subject'].value.trim();
      var message = form.elements['message'].value.trim();

      if (!name || !email || !message) {
        showNote('Please fill in your name, email, and a message.');
        return;
      }

      var to = 'eliu4864@gmail.com';
      var subjectLine = subject || ('Portfolio enquiry from ' + name);
      var bodyLines = [
        message,
        '',
        '—',
        'From: ' + name,
        'Email: ' + email
      ].join('\n');

      var mailto = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subjectLine) +
        '&body=' + encodeURIComponent(bodyLines);

      window.location.href = mailto;
      showNote('Opening your email app… If nothing happens, email eliu4864@gmail.com directly.');
    });
  }

  function showNote(text) {
    if (!note) return;
    note.textContent = text;
    note.hidden = false;
  }

})();
