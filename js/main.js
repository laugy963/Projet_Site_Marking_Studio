/* ==========================================================================
   MARKING STUDIO — Main JS
   ========================================================================== */

(function () {
  'use strict';

  // Mark as JS-enabled (used for reveal animations)
  document.documentElement.classList.add('js');

  /* ===== THEME =====
     The site is always cream (recto). The recto/verso rhythm is achieved
     per-section via [data-section="verso"], not a global theme. */
  document.documentElement.setAttribute('data-theme', 'light');

  /* ===== INTRO OVERLAY — "le site se construit" =====
     The <head> script adds html.intro-active before first paint (once per
     session, never under reduced-motion). Here we lock scroll, wire up skip
     gestures, and tear the overlay down when the choreography ends. */
  (function initIntro() {
    const root = document.documentElement;
    if (!root.classList.contains('intro-active')) return;
    const overlay = document.querySelector('.build-intro');
    if (!overlay) { root.classList.remove('intro-active'); return; }

    try { sessionStorage.setItem('ms-intro-seen', '1'); } catch (e) {}

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let finished = false;
    const skipEvents = ['wheel', 'touchmove', 'keydown'];

    function onSkip() { finish(); }

    function unbind() {
      skipEvents.forEach((ev) => window.removeEventListener(ev, onSkip));
      overlay.removeEventListener('click', onSkip);
    }

    function finish() {
      if (finished) return;
      finished = true;
      unbind();
      overlay.classList.add('is-out');
      const cleanup = () => {
        overlay.removeEventListener('transitionend', cleanup);
        root.classList.remove('intro-active');
        document.body.style.overflow = prevOverflow;
      };
      overlay.addEventListener('transitionend', cleanup);
      setTimeout(cleanup, 700); // fallback if transitionend never fires
    }

    skipEvents.forEach((ev) => window.addEventListener(ev, onSkip, { passive: true }));
    overlay.addEventListener('click', onSkip);
    setTimeout(finish, 1700); // end of the build choreography
  })();

  /* ===== HEADER SCROLL =====
     A 30px sentinel at the top of the document drives the scrolled state —
     no per-frame scroll listener needed. */
  const header = document.getElementById('header');
  if (header && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:30px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver((entries) => {
      header.classList.toggle('header--scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ===== MOBILE MENU ===== */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ===== REVEAL ON SCROLL ===== */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ===== MARKER HIGHLIGHTS ===== */
  const marks = document.querySelectorAll('.mark-hl');
  if (marks.length && 'IntersectionObserver' in window) {
    const markObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-marked');
            markObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    marks.forEach((m) => markObserver.observe(m));
  } else {
    marks.forEach((m) => m.classList.add('is-marked'));
  }

  /* ===== BEFORE/AFTER COMPARE SLIDER =====
     The invisible native range drives --pos (pointer, touch and keyboard). */
  document.querySelectorAll('.compare').forEach((compare) => {
    const range = compare.querySelector('.compare__range');
    if (!range) return;
    const setPos = (v) => compare.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => setPos(range.value));
    setPos(range.value);
  });

  /* ===== JOURNEY — cinematic timeline =====
     As each step crosses the viewport middle it becomes active and the sticky
     device advances through its build stages (wireframe → design → dev → live). */
  const journeyExp = document.querySelector('.journey__experience');
  const journeySteps = document.querySelectorAll('.journey-step[data-step]');
  const journeyDevice = document.querySelector('.journey__device');
  if (journeyExp && journeySteps.length && journeyDevice && 'IntersectionObserver' in window) {
    journeyExp.classList.add('is-cinematic');
    let activeStep = null;
    const setActive = (step) => {
      if (step === activeStep) return;
      if (activeStep) activeStep.classList.remove('is-active');
      step.classList.add('is-active');
      activeStep = step;
      journeyDevice.dataset.stage = step.dataset.step;
    };
    setActive(journeySteps[0]);
    const stepObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target); });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    journeySteps.forEach((s) => stepObs.observe(s));
  }

  /* ===== FORM HANDLING ===== */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const submitErrMsg = document.getElementById('formSubmitError');

  const ERROR_MESSAGES = {
    name:    'Veuillez indiquer votre nom complet.',
    email:   'Veuillez entrer une adresse courriel valide.',
    project: 'Veuillez sélectionner un type de projet.',
    message: 'Veuillez décrire votre projet.',
    rgpd:    'Vous devez accepter la politique de confidentialité.',
  };

  function getFieldError(field) {
    if (field.type === 'checkbox') return field.checked ? '' : (ERROR_MESSAGES[field.name] || 'Ce champ est requis.');
    if (field.type === 'email' && field.value.trim()) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()) ? '' : ERROR_MESSAGES.email;
    }
    return field.value.trim() ? '' : (ERROR_MESSAGES[field.name] || 'Ce champ est requis.');
  }

  function showFieldError(field, msg) {
    field.setAttribute('aria-invalid', 'true');
    field.style.borderColor = 'var(--accent)';
    let err = document.getElementById('err-' + field.name);
    if (!err) {
      err = document.createElement('span');
      err.id = 'err-' + field.name;
      err.className = 'form-error';
      err.setAttribute('role', 'alert');
      field.parentNode.appendChild(err);
    }
    err.textContent = msg;
    field.setAttribute('aria-describedby', 'err-' + field.name);
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.style.borderColor = '';
    const err = document.getElementById('err-' + field.name);
    if (err) err.textContent = '';
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let valid = true;
      let firstInvalid = null;
      required.forEach((field) => {
        const msg = getFieldError(field);
        if (msg) {
          showFieldError(field, msg);
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearFieldError(field);
        }
      });
      if (!valid) {
        firstInvalid.focus();
        return;
      }

      if (submitErrMsg) submitErrMsg.hidden = true;

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Envoi en cours…';
      form.setAttribute('aria-busy', 'true');

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

      // Guard against a stalled network: abort after 15s so the user is never
      // left stranded on "Envoi en cours…" with no way forward.
      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);

      const restore = () => {
        clearTimeout(timeout);
        form.removeAttribute('aria-busy');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      };
      const fail = (msg) => {
        restore();
        if (submitErrMsg) {
          submitErrMsg.textContent = msg;
          submitErrMsg.hidden = false;
          submitErrMsg.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
        }
      };

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
        .then((res) => {
          if (res.ok) {
            clearTimeout(timeout);
            form.removeAttribute('aria-busy');
            // Hide the fields (not the form itself) so the confirmation — which
            // lives inside the form — stays visible and focusable in the card.
            form.classList.add('is-sent');
            if (successMsg) {
              successMsg.hidden = false;
              // Move focus into the confirmation so screen-reader and keyboard
              // users land on it (the fields they were in are now hidden).
              successMsg.focus({ preventScroll: true });
              successMsg.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
            }
          } else {
            fail('Une erreur est survenue. Veuillez réessayer ou nous contacter par email.');
          }
        })
        .catch(() => {
          fail(timedOut
            ? 'Le serveur met trop de temps à répondre. Vérifiez votre connexion et réessayez.'
            : 'Impossible d\'envoyer le formulaire. Vérifiez votre connexion.');
        });
    });

    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });

    /* ----- Brief progress — "fiche projet" engagement bar ----- */
    const briefProgress = document.getElementById('briefProgress');
    if (briefProgress) {
      const pctLabel = briefProgress.querySelector('.brief__pct');
      const requiredFields = Array.from(form.querySelectorAll('[required]'));
      const isFilled = (f) => (f.type === 'checkbox' ? f.checked : f.value.trim() !== '');
      const updateBrief = () => {
        const filled = requiredFields.filter(isFilled).length;
        const pct = requiredFields.length ? Math.round((filled / requiredFields.length) * 100) : 0;
        briefProgress.style.setProperty('--progress', pct + '%');
        const complete = pct === 100;
        briefProgress.classList.toggle('is-complete', complete);
        if (pctLabel) {
          pctLabel.textContent = complete
            ? 'Votre projet est prêt à être étudié.'
            : 'Brief complété à ' + pct + ' %';
        }
      };
      form.querySelectorAll('input, select, textarea').forEach((f) => {
        f.addEventListener('input', updateBrief);
        f.addEventListener('change', updateBrief);
      });
      updateBrief();
    }
  }

  /* ===== SMOOTH SCROLL FOR ANCHORS ===== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.length <= 1) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
