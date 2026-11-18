import { test, expect, type Page } from '@playwright/test';

// Full-site check against a deployed BAYSE site (E2E_BASE_URL).
// 1. Every page loads, fits a phone screen and has no broken links or anchors.
// 2. Every interactive control on the home page responds (menu, phone tour, FAQs).
// 3. The whole sign-up journey works, from "Build my plan" to Today and Personalise.

const PUBLIC = ['/', '/live-classes', '/classes', '/programmes', '/clubs', '/faq', '/try', '/pricing', '/sign-in', '/start/welcome', '/privacy', '/terms', '/community-guidelines', '/staff'];

async function linksOn(page: Page) {
  return page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') || ''));
}

for (const path of PUBLIC) {
  test(`page ${path}: loads, fits, links and anchors work`, async ({ page, request, baseURL }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(path);
    expect(res?.status(), `${path} status`).toBeLessThan(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), 'no sideways scroll').toBe(false);
    const broken: string[] = [];
    for (const href of new Set(await linksOn(page))) {
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      if (href.startsWith('#') || href.startsWith('/#')) {
        if (href.startsWith('/#') && path !== '/') continue; // checked on the home page
        const id = href.split('#')[1];
        if (id?.startsWith('play-')) continue; // opens a class in the player, tested in the home test
        if (id && (await page.locator(`[id="${id}"]`).count()) === 0) broken.push(`missing anchor ${href}`);
        continue;
      }
      if (/^https?:/.test(href) && !href.startsWith(baseURL!)) continue; // external: studio site
      const r = await request.get(href, { maxRedirects: 5 });
      if (r.status() >= 400) broken.push(`${href} → ${r.status()}`);
    }
    expect(broken, `broken links on ${path}`).toEqual([]);
    expect(errors, `script errors on ${path}`).toEqual([]);
  });
}

test('home: menu, class library, player and favourites respond', async ({ page }) => {
  await page.goto('/');
  // Menu
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.locator('[data-menu] a[href="/pricing"]').click();
  await expect(page).toHaveURL(/\/pricing/);
  await expect(page.locator('[data-menu]')).toHaveCount(0); // closes after choosing
  await page.goto('/');
  // Class preview: three classes, then the free trial
  const cards = page.locator('[data-class-card]');
  await expect(cards).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Start my 7-day free trial' }).first()).toHaveAttribute('href', '/start/welcome');
  // The free class plays on the page; a members' class offers the free trial instead
  await cards.filter({ hasText: 'Free class' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Start workout' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toHaveCount(0);
  await cards.filter({ hasText: 'Members' }).first().click();
  await expect(dialog.getByRole('link', { name: 'Start 7 days free' })).toHaveAttribute('href', '/start/welcome');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  // Every call to action goes somewhere real
  // "Play a free class" opens the class in a window on the page, without leaving it
  await page.getByRole('button', { name: /Play a free class/ }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Start workout' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/$/);
  // "Free trial" opens sign-up in a window on the same page
  await page.getByRole('link', { name: 'Free trial', exact: true }).click();
  await expect(page.locator('[data-trial-window] iframe')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.frameLocator('[data-trial-window] iframe').getByRole('button', { name: 'Build my plan' })).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  for (const name of ['Start your 7-day free trial', 'Start free trial', 'See membership']) {
    const href = await page.getByRole('link', { name }).first().getAttribute('href');
    expect(href, name).toBeTruthy();
  }
});

test('home: phone tour and questions respond', async ({ page }) => {
  await page.goto('/');
  // Phone tour: every dot changes the caption
  const caption = page.locator('[data-caption]');
  const dots = page.locator('[data-dot]');
  const n = await dots.count();
  expect(n).toBeGreaterThan(5);
  for (let i = n - 1; i >= 0; i--) {
    const label = await dots.nth(i).getAttribute('aria-label');
    await dots.nth(i).click();
    await expect(caption).toHaveText(label!, { timeout: 4000 });
  }
  // FAQs open
  const first = page.locator('#faq details').first();
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  for (const name of ['Build my plan', 'Start your 7-day free trial']) {
    const href = await page.getByRole('link', { name }).first().getAttribute('href');
    expect(href, name).toBeTruthy();
  }
});

test('signed-out visitors are sent to sign in from member areas', async ({ page }) => {
  for (const path of ['/today', '/you', '/you/personalise', '/admin']) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/sign-in/);
  }
});

test('email links: an expired or empty link explains what to do', async ({ page }) => {
  await page.goto('/auth/callback?next=/auth/reset');
  await expect(page).toHaveURL(/\/auth\/link/);
  await expect(page.getByRole('heading', { name: 'That link has expired' })).toBeVisible();
  await page.goto('/auth/link?next=/auth/reset#access_token=bad&refresh_token=bad');
  await expect(page.getByRole('heading', { name: 'That link has expired' })).toBeVisible();
});

test('sign in: wrong password shows a friendly error', async ({ page }) => {
  await page.goto('/sign-in');
  await page.locator('#email').fill('nobody@bayse-test.invalid');
  await page.locator('#password').fill('wrong-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert').or(page.getByText(/not right|incorrect|could not|invalid/i)).first()).toBeVisible({ timeout: 10000 });
});

test('full journey: build my plan → account → Today → Personalise', async ({ page }) => {
  test.setTimeout(120_000);
  const cont = () => page.getByRole('button', { name: 'Continue' }).click();
  await page.goto('/start/welcome');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await expect(page, 'Build my plan should open the name step (Supabase anonymous sign-ins must be on)').toHaveURL(/\/start\/name/, { timeout: 15000 });

  await page.getByLabel('First name').fill('Test');
  await page.getByLabel(/display name/i).fill('Test Member');
  await page.getByLabel(/18 or over/).check();
  await cont();
  await expect(page).toHaveURL(/\/start\/goals/);
  await page.getByText('Develop core strength').click();
  await page.getByText('Improve posture').click();
  await cont();
  await expect(page).toHaveURL(/\/start\/experience/);
  await page.getByText('A little').click();
  await cont();
  await expect(page).toHaveURL(/\/start\/sessions/);
  await cont(); // 3 is preselected
  await expect(page).toHaveURL(/\/start\/programme/, { timeout: 15000 });
  await expect(page.getByText(/weeks/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Start this programme' }).click();
  await expect(page).toHaveURL(/\/start\/account/);

  const email = `bayse.e2e+${Date.now()}@example.com`;
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('TestPassword-2026!');
  await page.locator('input[name="terms"]').check();
  await page.getByRole('button', { name: 'Create my account' }).click();
  await expect(page, 'account creation should move on to membership').toHaveURL(/\/start\/membership/, { timeout: 15000 });
  await expect(page.getByText('BAYSE Club').first()).toBeVisible();

  await page.getByRole('button', { name: /decide later|continue/i }).last().click();
  await expect(page).toHaveURL(/\/today/, { timeout: 15000 });
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
  await expect(page.getByText('Your weekly progress')).toBeVisible();

  // Bottom navigation
  for (const [name, url] of [['Train', /\/train/], ['Live', /\/live/], ['Community', /\/community/], ['You', /\/you/], ['Today', /\/today/]] as const) {
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name }).click();
    await expect(page, name).toHaveURL(url);
  }

  // Personalise: answer one optional question and come back
  await page.goto('/you/personalise');
  await page.getByRole('link', { name: /What do you enjoy/i }).click();
  await page.getByText('Mat Pilates').click();
  await cont();
  await expect(page).toHaveURL(/\/you\/personalise\?saved=training/);
  await expect(page.getByText('Done ✓').first()).toBeVisible();

  // Membership and privacy pages open
  await page.goto('/you/membership');
  await expect(page.locator('h1')).toBeVisible();
  await page.goto('/you/privacy');
  await expect(page.locator('h1')).toBeVisible();
});

test('stripe webhook rejects unsigned requests', async ({ request }) => {
  const res = await request.post('/api/stripe/webhook', { data: { id: 'evt_fake', type: 'customer.subscription.created' } });
  expect([400, 500, 503]).toContain(res.status());
});
