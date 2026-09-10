(() => {
  const storageKey = 'portfolio.locale';

  for (const link of document.querySelectorAll('[data-locale-link]')) {
    link.addEventListener('click', () => {
      const locale = link.getAttribute('data-locale-link');
      if (locale !== 'es' && locale !== 'en') return;

      try {
        window.localStorage.setItem(storageKey, locale);
      } catch {
        // The normal link remains the navigation fallback when storage is unavailable.
      }
    });
  }
})();
