import { test, expect } from '@playwright/test';

// Payments readiness check against the live site. It never enters card details and never pays:
// it only confirms that the keys are in place and that Stripe's payment form opens for each plan.
// Run from the "Payments check" workflow; read the lines starting with RESULT.

test('webhook: keys and signing secret are configured', async ({ request }) => {
  const res = await request.post('/api/stripe/webhook', { headers: { 'stripe-signature': 't=1,v1=bad' }, data: { id: 'evt_check' } });
  const body = await res.text();
  console.log(`RESULT webhook status=${res.status()} body=${body.slice(0, 120)}`);
  // 400 "Invalid signature" = secret key and webhook secret are both set. 500 = something is missing.
  expect(res.status(), 'webhook should answer 400 Invalid signature when configured').toBe(400);
});

test('checkout: Stripe payment form opens for each plan', async ({ page }) => {
  test.setTimeout(240_000);
  const cont = () => page.getByRole('button', { name: 'Continue' }).click();
  await page.goto('/start/welcome');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await page.waitForURL(/\/start\/name/, { timeout: 20000 });
  await page.getByLabel('First name').fill('Check');
  await page.getByLabel(/display name/i).fill('Payments Check');
  await page.getByLabel(/18 or over/).check();
  await cont(); await page.waitForURL(/\/start\/goals/);
  await page.getByText('Develop core strength').click();
  await cont(); await page.waitForURL(/\/start\/experience/);
  await page.getByText('A little').click();
  await cont(); await page.waitForURL(/\/start\/sessions/);
  await cont(); await page.waitForURL(/\/start\/programme/, { timeout: 20000 });
  await page.getByRole('button', { name: 'Start this programme' }).click();
  await page.waitForURL(/\/start\/health/);
  for (const g of await page.locator('[data-health-form] [role="radiogroup"]').all()) await g.getByText('No').click();
  await page.locator('input[name="consent"]').check();
  await page.locator('input[name="agree"]').check();
  await page.locator('input[name="signed_name"]').fill('Payments Check');
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  await page.waitForURL(/\/start\/account/, { timeout: 20000 });
  await page.locator('#email').fill(`bayse.paycheck+${Date.now()}@example.com`);
  await page.locator('#password').fill(`Check-${Date.now()}-Aa!`);
  await page.locator('input[name="terms"]').check();
  await page.getByRole('button', { name: 'Create my account' }).click();
  await page.waitForURL(/\/join/, { timeout: 20000 });

  await page.locator('a[href*="/join?price="]').first().waitFor({ timeout: 20000 }).catch(() => {});
  const links = await page.$$eval('a[href*="/join?price="]', (as) => as.map((a) => ({ href: a.getAttribute('href')!, text: (a.textContent ?? '').trim() })));
  await page.waitForLoadState('networkidle').catch(() => {});
  console.log(`RESULT buttons: ${(await page.$$eval('main a, main button, main [aria-disabled]', (els) => els.map((e) => `${e.tagName}:${(e.textContent ?? '').trim().slice(0, 40)}:${e.getAttribute('href') ?? ''}`))).join(' || ').slice(0, 900)}`);
  if (!links.length) console.log(`RESULT join page says: ${(await page.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 500)}`);
  console.log(`RESULT plans offered=${links.length} ${links.map((l) => l.text).join(' | ')}`);
  expect(links.length, 'three plans can be chosen').toBeGreaterThanOrEqual(3);

  let opened = 0;
  for (const l of links) {
    const stripeCalls: string[] = [];
    const onReq = (r: { url: () => string }) => { if (r.url().includes('stripe.com')) stripeCalls.push(r.url()); };
    page.on('request', onReq);
    await page.goto(l.href);
    const heading = (await page.locator('h1').first().textContent()) ?? '';
    const card = (await page.locator('main').innerText()).split('\n').slice(0, 8).join(' / ');
    const frame = page.locator('iframe[name^="embedded-checkout"], iframe[src*="checkout.stripe.com"], iframe[src*="js.stripe.com"]');
    const alert = page.locator('[role="alert"]');
    const off = page.getByText('Payments are being switched on');
    await Promise.race([frame.first().waitFor({ state: 'attached', timeout: 30000 }), alert.first().waitFor({ timeout: 30000 }), off.first().waitFor({ timeout: 30000 })]).catch(() => {});
    await page.waitForTimeout(4000);
    const live = stripeCalls.some((u) => /pk_live|cs_live/.test(u)), testMode = stripeCalls.some((u) => /pk_test|cs_test/.test(u));
    const state = (await off.count()) ? 'NOT CONNECTED (publishable key or price missing)'
      : (await alert.count()) ? `ERROR: ${(await alert.first().innerText()).split('\n')[0]}`
      : (await frame.count()) ? 'PAYMENT FORM OPENED' : 'NOTHING SHOWN';
    if (state === 'PAYMENT FORM OPENED') opened++;
    console.log(`RESULT ${heading} :: ${card.slice(0, 140)} :: ${state} :: mode=${live ? 'LIVE' : testMode ? 'TEST' : 'unknown'}`);
    page.off('request', onReq);
  }
  expect(opened, 'payment form opened for every plan').toBe(links.length);
});
