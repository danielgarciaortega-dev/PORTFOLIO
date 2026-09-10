import { expect, test } from '@playwright/test';

const expectedTechnologies = [
  'HTML5',
  'CSS3',
  'JavaScript',
  'TypeScript',
  'React',
  'Angular',
  'Next.js',
  'Java',
  'Python',
  'FastAPI',
  'Node.js',
  'Laravel/PHP',
  'REST APIs',
  'SQL',
  'PostgreSQL',
  'MySQL/MariaDB',
  'BigQuery',
  'Git',
  'Docker',
];

test('professional overview uses approved English copy and recruiter-facing technology inventory', async ({
  page,
}) => {
  await page.goto('./en/');

  const overview = page.locator('.home-overview');
  await expect(overview).toBeVisible();
  await expect(overview).toHaveAttribute('aria-label', 'Professional overview');

  await expect(overview).toContainText('Technologies');
  await expect(overview).toContainText('Education');
  await expect(overview).toContainText('Experience');
  await expect(overview).toContainText(
    'Higher Technician in Web Application Development',
  );
  await expect(overview).toContainText(
    'Technician in Administrative Management',
  );
  await expect(overview).toContainText('2025 — Present');

  await expect(overview).toContainText('Web Development Intern');
  await expect(overview).toContainText('Telesales and Customer Service');
  await expect(overview).toContainText('Customer Service');
  await expect(overview).toContainText('Healthcare SaaS platform');

  await expect(overview).toContainText('Data');
  await expect(overview).toContainText('Tools');
  await expect(overview).toContainText('REST APIs');

  const technologies = overview.locator('.home-overview__technologies li');
  await expect(technologies).toHaveCount(expectedTechnologies.length);
  await expect(technologies.locator('span')).toHaveText(expectedTechnologies);
  await expect(technologies.locator('img')).toHaveCount(
    expectedTechnologies.length,
  );
  await expect(
    overview.locator('.home-overview__technologies'),
  ).not.toContainText('GitHub');
});
