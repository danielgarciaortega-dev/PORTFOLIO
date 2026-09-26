import { resolveLocaleFromPathname, type Locale } from '../i18n/locale';

interface ShellPayload {
  skipLink: string;
  brandHomeLabel: string;
  mainNavigation: string;
  home: string;
  about: string;
  projects: string;
  viewCv: string;
  openMenu: string;
  navigation: string;
  closeMenu: string;
  mobileNavigation: string;
  mobileViewCv: string;
  languageSwitcher: string;
}

interface NotFoundPayload {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  body: string;
  homeAction: string;
  projectsAction: string;
}

interface LocalePayload {
  shell: ShellPayload;
  notFound: NotFoundPayload;
  routes: {
    home: string;
    about: string;
    projects: string;
    cv: string;
    localeTarget: {
      locale: Locale;
      href: string;
      label: string;
    };
  };
}

function setText(selector: string, value: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function setAttribute(selector: string, name: string, value: string) {
  document.querySelector<HTMLElement>(selector)?.setAttribute(name, value);
}

function setMetaContent(selector: string, value: string) {
  document
    .querySelector<HTMLMetaElement>(selector)
    ?.setAttribute('content', value);
}

function setDirectText(element: Element | null | undefined, value: string) {
  if (!element) return;

  const textNode = Array.from(element.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );

  if (textNode) {
    textNode.textContent = `${value} `;
  } else {
    element.prepend(document.createTextNode(`${value} `));
  }
}

function localizeHeader(data: LocalePayload) {
  const { shell, routes } = data;

  setText('.skip-link', shell.skipLink);
  setAttribute('.brand', 'aria-label', shell.brandHomeLabel);
  setAttribute('.brand', 'href', routes.home);

  const desktopNavigation = document.querySelector<HTMLElement>(
    '.desktop-navigation',
  );
  desktopNavigation?.setAttribute('aria-label', shell.mainNavigation);
  const desktopLinks =
    desktopNavigation?.querySelectorAll<HTMLAnchorElement>('a');
  setDirectText(desktopLinks?.[0], shell.home);
  desktopLinks?.[0]?.setAttribute('href', routes.home);
  setDirectText(desktopLinks?.[1], shell.about);
  desktopLinks?.[1]?.setAttribute('href', routes.about);
  setDirectText(desktopLinks?.[2], shell.projects);
  desktopLinks?.[2]?.setAttribute('href', routes.projects);

  setText('.header-cv-link', shell.viewCv);
  setAttribute('.header-cv-link', 'href', routes.cv);

  const menuTrigger =
    document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (menuTrigger) {
    menuTrigger.setAttribute('aria-label', shell.openMenu);
    menuTrigger.dataset.openLabel = shell.openMenu;
    menuTrigger.dataset.closeLabel = shell.closeMenu;
  }

  setText('#mobile-menu-title', shell.navigation);
  setAttribute('[data-menu-close]', 'aria-label', shell.closeMenu);

  const mobileNavigation = document.querySelector<HTMLElement>(
    '#mobile-navigation nav',
  );
  mobileNavigation?.setAttribute('aria-label', shell.mobileNavigation);
  const mobileLinks =
    mobileNavigation?.querySelectorAll<HTMLAnchorElement>('a[data-menu-link]');
  setDirectText(mobileLinks?.[0], shell.home);
  mobileLinks?.[0]?.setAttribute('href', routes.home);
  setDirectText(mobileLinks?.[1], shell.about);
  mobileLinks?.[1]?.setAttribute('href', routes.about);
  setDirectText(mobileLinks?.[2], shell.projects);
  mobileLinks?.[2]?.setAttribute('href', routes.projects);

  setText('.mobile-menu__cv', shell.mobileViewCv);
  setAttribute('.mobile-menu__cv', 'href', routes.cv);

  document
    .querySelectorAll<HTMLElement>('[data-language-switcher]')
    .forEach((switcher) => {
      switcher.setAttribute('aria-label', shell.languageSwitcher);
      const link =
        switcher.querySelector<HTMLAnchorElement>('[data-locale-link]');
      if (!link) return;

      link.setAttribute('href', routes.localeTarget.href);
      link.setAttribute('lang', routes.localeTarget.locale);
      link.setAttribute('hreflang', routes.localeTarget.locale);
      link.setAttribute('aria-label', routes.localeTarget.label);
      link.dataset.localeLink = routes.localeTarget.locale;
      link.textContent = routes.localeTarget.locale.toUpperCase();
    });
}

function localizeNotFoundPage(data: LocalePayload, locale: Locale) {
  const { notFound, routes } = data;

  document.documentElement.lang = locale;
  document.title = notFound.title;
  setMetaContent('meta[name="description"]', notFound.description);
  setMetaContent('meta[property="og:title"]', notFound.title);
  setMetaContent('meta[property="og:description"]', notFound.description);
  setMetaContent('meta[name="twitter:title"]', notFound.title);
  setMetaContent('meta[name="twitter:description"]', notFound.description);
  setMetaContent(
    'meta[property="og:locale"]',
    locale === 'en' ? 'en_GB' : 'es_ES',
  );

  setText('[data-not-found-eyebrow]', notFound.eyebrow);
  setText('[data-not-found-heading]', notFound.heading);
  setText('[data-not-found-body]', notFound.body);
  setText('[data-not-found-home-label]', notFound.homeAction);
  setText('[data-not-found-projects-label]', notFound.projectsAction);
  setAttribute('.not-found__home', 'href', routes.home);
  setAttribute('.not-found__projects', 'href', routes.projects);
}

function initializeNotFoundLocale() {
  const dataElement = document.querySelector<HTMLScriptElement>(
    '#not-found-locale-data',
  );
  if (!dataElement?.textContent) return;

  let payload: Record<Locale, LocalePayload>;
  try {
    payload = JSON.parse(dataElement.textContent) as Record<
      Locale,
      LocalePayload
    >;
  } catch {
    return;
  }

  const locale = resolveLocaleFromPathname(
    window.location.pathname,
    import.meta.env.BASE_URL,
  );
  const data = payload[locale];
  if (!data) return;

  localizeNotFoundPage(data, locale);
  localizeHeader(data);
}

initializeNotFoundLocale();
