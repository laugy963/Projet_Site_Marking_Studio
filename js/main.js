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

  /* ===== HEADER SCROLL ===== */
  const header = document.getElementById('header');
  if (header) {
    let lastScrollY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 30) header.classList.add('header--scrolled');
      else header.classList.remove('header--scrolled');
      lastScrollY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then((res) => {
          if (res.ok) {
            form.style.display = 'none';
            if (successMsg) {
              successMsg.hidden = false;
              successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            if (submitErrMsg) {
              submitErrMsg.textContent = 'Une erreur est survenue. Veuillez réessayer ou nous contacter par email.';
              submitErrMsg.hidden = false;
            }
          }
        })
        .catch(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          if (submitErrMsg) {
            submitErrMsg.textContent = 'Impossible d\'envoyer le formulaire. Vérifiez votre connexion.';
            submitErrMsg.hidden = false;
          }
        });
    });

    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });
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
