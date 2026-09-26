import { expect, test } from '@playwright/test';

const routes = ['./proyectos/', './en/projects/'];
const expectedDelays = ['-2s', '6s', '14s', '22s', '30s', '38s'];
const expectedDesktopPositions = [
  'center 38%',
  'center 42%',
  'center 36%',
  'center 42%',
  'center 40%',
  'center 55%',
];
const expectedMobilePositions = [
  '50% center',
  '50% center',
  '44% center',
  '34% center',
  '38% center',
  '50% center',
];

test('project backdrop uses one shared six-moment timing and crop contract', async ({
  page,
}) => {
  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);

    const moments = page.locator('.projects-page__backdrop img');
    await expect(moments).toHaveCount(6);

    const contract = await moments.evaluateAll((images) =>
      images.map((image) => {
        const style = getComputedStyle(image);
        return {
          duration: style.animationDuration,
          delay: style.animationDelay,
          timing: style.animationTimingFunction,
          loading: image.getAttribute('loading'),
          fetchPriority: image.getAttribute('fetchpriority'),
          decoding: image.getAttribute('decoding'),
          desktopPosition: image.style
            .getPropertyValue('--moment-position-desktop')
            .trim(),
          mobilePosition: image.style
            .getPropertyValue('--moment-position-mobile')
            .trim(),
        };
      }),
    );

    expect(contract.map(({ duration }) => duration)).toEqual(
      Array(6).fill('48s'),
    );
    expect(contract.map(({ delay }) => delay)).toEqual(expectedDelays);
    expect(contract.map(({ timing }) => timing)).toEqual(
      Array(6).fill('linear'),
    );
    expect(contract.map(({ loading }) => loading)).toEqual([
      'eager',
      'eager',
      'lazy',
      'lazy',
      'lazy',
      'lazy',
    ]);
    expect(contract[0]?.fetchPriority).toBe('high');
    expect(contract.map(({ decoding }) => decoding)).toEqual(
      Array(6).fill('async'),
    );
    expect(contract.map(({ desktopPosition }) => desktopPosition)).toEqual(
      expectedDesktopPositions,
    );
    expect(contract.map(({ mobilePosition }) => mobilePosition)).toEqual(
      expectedMobilePositions,
    );

    const keyframeOffsets = await moments.first().evaluate((image) => {
      const animation = image.getAnimations()[0];
      if (!(animation?.effect instanceof KeyframeEffect)) {
        throw new Error('Project backdrop animation is missing');
      }

      return animation.effect
        .getKeyframes()
        .map(({ offset }) => offset)
        .filter((offset): offset is number => offset !== null);
    });

    expect(keyframeOffsets).toHaveLength(5);
    expect(keyframeOffsets[0]).toBeCloseTo(0, 5);
    expect(keyframeOffsets[1]).toBeCloseTo(0.04, 5);
    expect(keyframeOffsets[2]).toBeCloseTo(0.16667, 4);
    expect(keyframeOffsets[3]).toBeCloseTo(0.20833, 4);
    expect(keyframeOffsets[4]).toBeCloseTo(1, 5);
  }
});

test('portrait mobile crops de-emphasize dominant subjects without changing landscape crops', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./proyectos/');

  const positions = await page
    .locator('.projects-page__backdrop img')
    .evaluateAll((images) =>
      images.map((image) => getComputedStyle(image).objectPosition),
    );

  expect(positions).toEqual([
    '50% 50%',
    '50% 50%',
    '44% 50%',
    '34% 50%',
    '38% 50%',
    '50% 50%',
  ]);

  await page.setViewportSize({ width: 844, height: 390 });
  await page.reload();

  const landscapeMomentSix = await page
    .locator('.projects-page__backdrop img')
    .nth(5)
    .evaluate((image) => getComputedStyle(image).objectPosition);

  expect(landscapeMomentSix).toBe('50% 55%');
});

test('reduced motion keeps one stable backdrop with no blur, transform or layout contribution', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./proyectos/');

  const moments = page.locator('.projects-page__backdrop img');
  const styles = await moments.evaluateAll((images) =>
    images.map((image) => {
      const style = getComputedStyle(image);
      return {
        animationName: style.animationName,
        opacity: style.opacity,
        filter: style.filter,
        transform: style.transform,
      };
    }),
  );

  expect(styles.map(({ animationName }) => animationName)).toEqual(
    Array(6).fill('none'),
  );
  expect(styles[0]?.opacity).toBe('1');
  expect(styles.slice(1).map(({ opacity }) => opacity)).toEqual(
    Array(5).fill('0'),
  );
  expect(styles.map(({ filter }) => filter)).toEqual(Array(6).fill('none'));
  expect(styles.map(({ transform }) => transform)).toEqual(
    Array(6).fill('none'),
  );

  const content = page.locator('.projects-page-list--solo');
  const before = await content.boundingBox();
  await page
    .locator('.projects-page__backdrop')
    .evaluate((backdrop) => ((backdrop as HTMLElement).style.display = 'none'));
  const after = await content.boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  if (before && after) {
    expect(after.x).toBeCloseTo(before.x, 3);
    expect(after.y).toBeCloseTo(before.y, 3);
    expect(after.width).toBeCloseTo(before.width, 3);
    expect(after.height).toBeCloseTo(before.height, 3);
  }

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
