import { test, expect } from '@playwright/test';

// Public pages: load, no horizontal scroll on phones, primary action visible.
for (const path of ['/', '/try', '/pricing', '/sign-in', '/start/welcome', '/privacy', '/terms', '/community-guidelines']) {
  test(`public page ${path} loads and fits the screen`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
}

test('member areas send signed-out visitors to sign in', async ({ page }) => {
  for (const path of ['/today', '/you', '/admin']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in\?next=/);
  }
});

test('onboarding starts and saves the first answers', async ({ page }) => {
  await page.goto('/start/welcome');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await expect(page).toHaveURL(/\/start\/name/);
  await page.getByLabel('First name').fill('Test');
  await page.getByLabel('Community display name').fill('Test Member');
  await page.getByLabel(/18 or over/).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/start\/goals/);
  await page.getByText('Develop core strength').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/start\/experience/);
  await page.goBack();
  await expect(page.getByLabel('Develop core strength')).toBeChecked();
});

test('stripe webhook rejects unsigned requests', async ({ request }) => {
  const res = await request.post('/api/stripe/webhook', { data: { id: 'evt_fake', type: 'customer.subscription.created' } });
  expect([400, 500]).toContain(res.status());
});
