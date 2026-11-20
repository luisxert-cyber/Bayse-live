import { test } from '@playwright/test';

// Pictures of the sign-up window on a phone-sized screen, so its fit can be checked. Saved to the shots branch.
test('sign-up window pictures', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Start my 7-day free trial' }).first().click();
  const frame = page.frameLocator('[data-trial-window] iframe');
  await frame.getByRole('button', { name: 'Build my plan' }).waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/signup-1-welcome.png' });
  await frame.getByRole('button', { name: 'Build my plan' }).click();
  await frame.getByLabel('First name').fill('Test');
  await frame.getByLabel(/display name/i).fill('Test');
  await frame.getByLabel(/18 or over/).check();
  await page.screenshot({ path: 'shots/signup-2-name.png' });
  await frame.getByRole('button', { name: 'Continue' }).click();
  await frame.getByText('Develop core strength').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/signup-3-goals.png' });
  await frame.getByText('Develop core strength').click();
  await frame.getByRole('button', { name: 'Continue' }).click();
  await frame.getByText('A little').waitFor();
  await frame.getByText('A little').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/signup-4-experience.png' });
  await frame.getByRole('button', { name: 'Continue' }).click();
  await frame.getByText('sessions a week').first().waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/signup-5-sessions.png' });
});
