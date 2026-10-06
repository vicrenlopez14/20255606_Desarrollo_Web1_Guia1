(function () {
  'use strict';
  const menuButton = document.getElementById('mobile-nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.querySelector('span:last-child').textContent = open ? 'Cerrar' : 'Menú';
    });
    nav.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -32px' });
    elements.forEach((element) => observer.observe(element));
  }
})();
