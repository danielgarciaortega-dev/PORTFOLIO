import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const projectRoutes = ['./proyectos/', './en/projects/'];

test('project pages use the shared dark-scrim contrast system', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const route of projectRoutes) {
    await page.goto(route);

    const styles = await page.locator('.projects-page').evaluate((root) => {
      const styleFor = (selector: string) => {
        const element = root.querySelector<HTMLElement>(selector);
        if (!element) {
          throw new Error(`Missing project contrast target: ${selector}`);
        }

        return getComputedStyle(element);
      };

      const meta = styleFor('.project-row__meta p');
      const title = styleFor('.project-row__content h2');
      const description = styleFor('.project-row__description');
      const action = styleFor('.project-row .text-action');
      const tag = styleFor('.project-row .tag-list li');
      const list = styleFor('.project-list');
      const row = styleFor('.project-row');

      return {
        metaColor: meta.color,
        metaShadow: meta.textShadow,
        titleColor: title.color,
        descriptionColor: description.color,
        descriptionShadow: description.textShadow,
        actionColor: action.color,
        actionShadow: action.textShadow,
        actionBorder: action.borderBottomColor,
        tagColor: tag.color,
        tagBackground: tag.backgroundColor,
        tagBorder: tag.borderColor,
        listBorder: list.borderTopColor,
        rowBorder: row.borderBottomColor,
      };
    });

    expect(styles.metaColor).toBe('rgba(255, 255, 255, 0.82)');
    expect(styles.metaShadow).toBe('none');
    expect(styles.titleColor).toBe('rgba(255, 255, 255, 0.96)');
    expect(styles.descriptionColor).toBe('rgba(255, 255, 255, 0.82)');
    expect(styles.descriptionShadow).toBe('none');
    expect(styles.actionColor).toBe('rgba(255, 255, 255, 0.96)');
    expect(styles.actionShadow).toBe('none');
    expect(styles.actionBorder).toBe('rgba(255, 255, 255, 0.58)');
    expect(styles.tagColor).toBe('rgba(255, 255, 255, 0.9)');
    expect(styles.tagBackground).toBe('rgba(255, 255, 255, 0.12)');
    expect(styles.tagBorder).toBe('rgba(255, 255, 255, 0.28)');
    expect(styles.listBorder).toBe('rgba(255, 255, 255, 0.26)');
    expect(styles.rowBorder).toBe('rgba(255, 255, 255, 0.26)');

    const action = page.locator('.project-row .text-action').first();

    await action.hover();
    await expect(action).toHaveCSS('border-bottom-color', 'rgb(231, 99, 54)');

    await action.focus();
    await expect(action).toBeFocused();
    await expect(action).toHaveCSS('outline-color', 'rgb(231, 99, 54)');
  }
});

test('project contrast treatment removes the legacy cream halo without changing global tokens', async () => {
  const css = await readFile('src/styles/global.css', 'utf8');

  expect(css).toContain(
    'background: color-mix(in srgb, var(--color-text) 66%, transparent);',
  );
  expect(css).not.toContain(
    'background: color-mix(in srgb, var(--color-bg) 56%, transparent);',
  );
  expect(css).not.toContain('0 0 10px var(--color-bg)');
  expect(css).toContain('--color-text-muted: #5b6473;');
});
