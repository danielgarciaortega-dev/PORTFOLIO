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

interface DialogPayload {
  aboutEyebrow: string;
  viewGitHub: string;
  viewLinkedIn: string;
  closeAbout: string;
  educationAndProjects: string;
  seeking: string;
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

interface ProfilePayload {
  aboutImageAlt: string;
  location: string;
  aboutIntro: string;
  milestones: Array<{ label: string; text: string }>;
  seeking: string;
}

interface LocalePayload {
  shell: ShellPayload;
  dialog: DialogPayload;
  notFound: NotFoundPayload;
  profile: ProfilePayload;
  routes: {
    home: string;
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
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
}

function setDirectText(element: Element | undefined, value: string) {
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
  const desktopLinks = desktopNavigation?.querySelectorAll<HTMLAnchorElement>('a');
  setDirectText(desktopLinks?.[0], shell.home);
  desktopLinks?.[0]?.setAttribute('href', routes.home);
  setDirectText(
    desktopNavigation?.querySelector<HTMLButtonElement>(
      '[data-dialog-open="about-dialog"]',
    ),
    shell.about,
  );
  setDirectText(desktopLinks?.[1], shell.projects);
  desktopLinks?.[1]?.setAttribute('href', routes.projects);

  setText('.header-cv-link', shell.viewCv);
  setAttribute('.header-cv-link', 'href', routes.cv);

  const menuTrigger = document.querySelector<HTMLButtonElement>('[data-menu-open]');
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
  const mobileLinks = mobileNavigation?.querySelectorAll<HTMLAnchorElement>(
    'a[data-menu-link]',
  );
  setDirectText(mobileLinks?.[0], shell.home);
  mobileLinks?.[0]?.setAttribute('href', routes.home);
  setDirectText(
    mobileNavigation?.querySelector<HTMLButtonElement>('[data-menu-action]'),
    shell.about,
  );
  setDirectText(mobileLinks?.[1], shell.projects);
  mobileLinks?.[1]?.setAttribute('href', routes.projects);

  setText('.mobile-menu__cv', shell.mobileViewCv);
  setAttribute('.mobile-menu__cv', 'href', routes.cv);

  document
    .querySelectorAll<HTMLElement>('[data-language-switcher]')
    .forEach((switcher) => {
      switcher.setAttribute('aria-label', shell.languageSwitcher);
      const link = switcher.querySelector<HTMLAnchorElement>('[data-locale-link]');
      if (!link) return;

      link.setAttribute('href', routes.localeTarget.href);
      link.setAttribute('lang', routes.localeTarget.locale);
      link.setAttribute('hreflang', routes.localeTarget.locale);
      link.setAttribute('aria-label', routes.localeTarget.label);
      link.dataset.localeLink = routes.localeTarget.locale;
      link.textContent = routes.localeTarget.locale.toUpperCase();
    });
}

function localizeAboutDialog(data: LocalePayload) {
  const { dialog, profile } = data;

  setText('[data-about-eyebrow]', dialog.aboutEyebrow);
  setAttribute('[data-about-github-link]', 'aria-label', dialog.viewGitHub);
  setAttribute('[data-about-github-link]', 'title', dialog.viewGitHub);
  setAttribute('[data-about-linkedin-link]', 'aria-label', dialog.viewLinkedIn);
  setAttribute('[data-about-linkedin-link]', 'title', dialog.viewLinkedIn);
  setAttribute('[data-about-close]', 'aria-label', dialog.closeAbout);
  setAttribute('[data-about-image]', 'alt', profile.aboutImageAlt);
  setText('[data-about-location]', profile.location);
  setText('[data-about-intro]', profile.aboutIntro);
  setText('[data-about-education-title]', dialog.educationAndProjects);
  setText('[data-about-seeking-title]', dialog.seeking);
  setText('[data-about-seeking]', profile.seeking);

  const milestones = document.querySelector<HTMLUListElement>(
    '[data-about-milestones]',
  );
  if (milestones) {
    const items = profile.milestones.map((milestone) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      const text = document.createElement('p');
      label.textContent = milestone.label;
      text.textContent = milestone.text;
      item.append(label, text);
      return item;
    });
    milestones.replaceChildren(...items);
  }
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
  setMetaContent('meta[property="og:locale"]', locale === 'en' ? 'en_GB' : 'es_ES');

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
    payload = JSON.parse(dataElement.textContent) as Record<Locale, LocalePayload>;
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
  localizeAboutDialog(data);
}

initializeNotFoundLocale();
