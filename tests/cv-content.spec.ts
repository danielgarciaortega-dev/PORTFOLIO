import { expect, test } from '@playwright/test';

test(
  'CV Tools and structured data keep the corrected technology baseline',
  async ({ page }) => {
    const response = await page.goto('./cv/');
    expect(response?.ok()).toBe(true);

    const toolsGroup = page.locator('.stack-group').filter({
      has: page.getByRole('heading', { level: 3, name: 'Herramientas' }),
    });
    const visibleTools = await toolsGroup.locator('.chips span').allTextContents();

    expect(visibleTools).toEqual(['Git/GitHub', 'Docker', 'Prisma']);
    expect(visibleTools).not.toContain('Vercel');

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(structuredData).not.toBeNull();

    const person = JSON.parse(structuredData ?? '{}') as {
      knowsAbout?: string[];
    };
    expect(person.knowsAbout).toBeDefined();
    expect(person.knowsAbout).toContain('Git/GitHub');
    expect(person.knowsAbout).toContain('Docker');
    expect(person.knowsAbout).toContain('Prisma');
    expect(person.knowsAbout).not.toContain('Vercel');
  },
);
