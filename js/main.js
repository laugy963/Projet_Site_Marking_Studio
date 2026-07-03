/* ==========================================================================
   MARKING STUDIO — Main JS
   ========================================================================== */

(function () {
  'use strict';

  // Mark as JS-enabled (used for reveal animations)
  document.documentElement.classList.add('js');

  const reduceMotionPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== THEME =====
     "Studio Noir" — the page is always dark (charcoal recto). The recto/verso
     rhythm is a second, deeper dark applied per-section via
     [data-section="verso"], not a global theme attribute. */

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

  /* ===== HERO SCROLL EXIT =====
     Le bloc hero (titre + sous-titre + CTA) remonte plus vite que le scroll
     et s'estompe — scrubbé, donc réversible en remontant. Jamais sous
     reduced-motion ; sans JS, aucun style inline n'est posé. */
  const hero = document.querySelector('.hero');
  const heroBody = document.querySelector('.hero__body');
  if (hero && heroBody && !reduceMotionPref) {
    let heroH = hero.offsetHeight;
    let lastP = -1;
    let ticking = false;

    function updateHeroExit() {
      ticking = false;
      // Prononcé : le bloc a totalement disparu à ~55 % de la hauteur du hero
      const p = Math.min(Math.max(window.scrollY / (heroH * 0.55), 0), 1);
      if (p === lastP) return;
      lastP = p;
      heroBody.style.transform = 'translateY(' + (-p * heroH * 0.28).toFixed(1) + 'px)';
      heroBody.style.opacity = String(1 - p);
      // Une fois invisible, les CTA ne doivent être ni cliquables ni focusables
      heroBody.style.visibility = p >= 1 ? 'hidden' : '';
    }
    function requestHeroExit() {
      // lastP < 1 rattrape un saut de scroll qui dépasse le hero d'un coup
      if (!ticking && (window.scrollY <= heroH || lastP < 1)) {
        ticking = true;
        requestAnimationFrame(updateHeroExit);
      }
    }
    window.addEventListener('scroll', requestHeroExit, { passive: true });
    window.addEventListener('resize', () => {
      heroH = hero.offsetHeight;
      lastP = -1;
      requestHeroExit();
    });
    updateHeroExit();
  }

  /* ===== ANSWER — STACKING CARDS =====
     L'empilement est en pur CSS (position:sticky) : dégradation propre sans JS.
     Ici on scrubbe seulement la profondeur : chaque carte recouverte rétrécit,
     remonte légèrement et s'assombrit (voile ::after piloté par --covered).
     Jamais sous reduced-motion ni ≤880px ; réversible en remontant. */
  const answerStack = document.querySelector('.answer-stack');
  if (answerStack && !reduceMotionPref) {
    const pins = Array.from(answerStack.querySelectorAll('.answer-stack__pin'));
    const cards = pins.map((p) => p.querySelector('.answer-card'));
    if (pins.length > 1 && cards.every(Boolean)) {
      const mqMobile = window.matchMedia('(max-width: 880px)');
      let dockTops = [];
      let travel = 1;
      let stackTicking = false;
      const lastCovered = new Array(cards.length).fill(-1);

      function measureStack() {
        // Le top sticky (calc résolu en px) = position d'ancrage de chaque pin
        dockTops = pins.map((p) => parseFloat(getComputedStyle(p).top) || 0);
        travel = Math.max(120, window.innerHeight * 0.2); // ≈ le gap de 20vh
      }
      function clearStackStyles() {
        cards.forEach((card, i) => {
          card.style.transform = '';
          card.style.removeProperty('--covered');
          lastCovered[i] = -1;
        });
      }
      function updateStack() {
        stackTicking = false;
        if (mqMobile.matches) return;
        const rect = answerStack.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        // progress[j] : 0 → 1 pendant que le pin j parcourt son dernier "gap"
        // avant de s'ancrer ; la profondeur d'une carte = somme des suivants
        const progress = pins.map((p, i) => {
          const d = p.getBoundingClientRect().top - dockTops[i];
          return Math.min(Math.max(1 - d / travel, 0), 1);
        });
        for (let i = 0; i < cards.length - 1; i++) {
          let covered = 0;
          for (let j = i + 1; j < pins.length; j++) covered += progress[j];
          const c = Math.round(covered * 1000) / 1000;
          if (c === lastCovered[i]) continue;
          lastCovered[i] = c;
          if (c === 0) {
            cards[i].style.transform = '';
            cards[i].style.removeProperty('--covered');
          } else {
            cards[i].style.transform =
              'translateY(' + (-1.5 * c).toFixed(2) + '%) scale(' + (1 - 0.04 * c).toFixed(4) + ')';
            cards[i].style.setProperty('--covered', Math.min(0.18 * c, 0.6).toFixed(3));
          }
        }
      }
      function requestStackUpdate() {
        if (!stackTicking) {
          stackTicking = true;
          requestAnimationFrame(updateStack);
        }
      }
      window.addEventListener('scroll', requestStackUpdate, { passive: true });
      window.addEventListener('resize', () => {
        measureStack();
        if (mqMobile.matches) clearStackStyles();
        else requestStackUpdate();
      });
      if (mqMobile.addEventListener) {
        mqMobile.addEventListener('change', (e) => {
          if (e.matches) clearStackStyles();
          else {
            measureStack();
            requestStackUpdate();
          }
        });
      }
      measureStack();
      updateStack();
    }
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

  /* ===== WORKS INDEX — letter-roll + aperçu curseur =====
     Chaque titre de rangée est éclaté en lettres (deux rangées superposées,
     le clone en orange) pour la bascule au survol, et une image d'aperçu
     unique suit le curseur au-dessus de la liste. Pointeur fin uniquement,
     jamais sous reduced-motion ; sans JS les titres restent du texte brut. */
  const workRows = document.querySelectorAll('.work-row');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (workRows.length && finePointer && !reduceMotionPref) {
    workRows.forEach((row) => {
      const name = row.querySelector('.work-row__name');
      if (!name) return;
      const text = name.textContent.trim();
      name.setAttribute('aria-label', text);
      const roll = document.createElement('span');
      roll.className = 'roll';
      roll.setAttribute('aria-hidden', 'true');
      ['roll__row', 'roll__row roll__row--clone'].forEach((cls) => {
        const line = document.createElement('span');
        line.className = cls;
        Array.from(text).forEach((ch, i) => {
          const letter = document.createElement('span');
          letter.className = 'roll__letter';
          letter.style.setProperty('--i', i);
          letter.textContent = ch;
          line.appendChild(letter);
        });
        roll.appendChild(line);
      });
      name.textContent = '';
      name.appendChild(roll);
    });

    const preview = document.createElement('div');
    preview.className = 'cursor-preview';
    preview.setAttribute('aria-hidden', 'true');
    const previewImg = document.createElement('img');
    previewImg.alt = '';
    preview.appendChild(previewImg);
    document.body.appendChild(preview);

    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    let rafId = null;
    let hovered = false;

    function tick() {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      // Décalé à droite du curseur, centré verticalement, retenu au bord droit
      const x = Math.min(curX + 28, window.innerWidth - preview.offsetWidth - 16);
      const y = curY - preview.offsetHeight / 2;
      preview.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      if (hovered || Math.abs(mouseX - curX) > 0.5 || Math.abs(mouseY - curY) > 0.5) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }
    function startLoop() {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    workRows.forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        const src = row.dataset.preview;
        if (!src) return;
        if (previewImg.getAttribute('src') !== src) previewImg.src = src;
        hovered = true;
        mouseX = e.clientX; mouseY = e.clientY;
        if (!preview.classList.contains('is-active')) { curX = mouseX; curY = mouseY; }
        preview.classList.add('is-active');
        startLoop();
      });
      row.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        startLoop();
      });
      row.addEventListener('mouseleave', () => {
        hovered = false;
        preview.classList.remove('is-active');
      });
    });
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
