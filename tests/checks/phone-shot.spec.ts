import { test } from '@playwright/test';

// Takes pictures of the homepage phone preview so its look can be checked. Saved to the shots branch.
test('phone preview pictures', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto('/');
  const tour = page.locator('[data-phone-tour]').first();
  await tour.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const track = tour.locator('[data-track]');
  for (let i = 0; i < 10; i++) {
    await track.evaluate((el, n) => { el.scrollTo({ left: n * el.clientWidth, behavior: 'instant' as ScrollBehavior }); }, i);
    await page.waitForTimeout(500);
    await tour.screenshot({ path: `shots/phone-${String(i + 1).padStart(2, '0')}.png` });
  }
});
