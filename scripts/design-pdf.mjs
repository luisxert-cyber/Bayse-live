// Builds "The BAYSE Club site design" PDF: every public page and the member app, on desktop and phone.
// Run by .github/workflows/design-pdf.yml against the live site. Uses a throwaway @example.com test
// account (left out of all figures) and the test-mode button, so member screens show unlocked.
// Output: design/bayse-club-site-design.pdf
import { chromium, devices } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.SITE_URL ?? 'https://thebayseclub.netlify.app';
const OUT = resolve('design');
const SHOTS = resolve(OUT, 'shots');
mkdirSync(SHOTS, { recursive: true });
const MAX_H = 15000; // CSS px; keeps each PDF page inside the format's size limit

const PUBLIC = [
  ['Home', '/'], ['Pricing', '/pricing'], ['Pricing · studio member: Yes', '/pricing#studio-members'],
  ['Features', '/features'], ['Benefits', '/benefits'], ['Free trial', '/free-trial'],
  ['Live classes', '/live-classes'], ['Class library', '/classes'], ['Programmes', '/programmes'],
  ['Reformer at home', '/reformer'], ['Instructors', '/instructors'], ['The community', '/the-community'],
  ['Who it’s for', '/who-its-for'], ['FAQ', '/faq'], ['Try a class', '/try'],
  ['Sign in', '/sign-in'], ['Staff sign in', '/staff'],
  ['Terms and conditions', '/terms'], ['Privacy policy', '/privacy'], ['Community guidelines', '/community-guidelines'],
];
const MEMBER = [
  ['Today', '/today'], ['Train', '/train'], ['Workout builder', '/train/build'], ['Programmes (app)', '/train/programmes'],
  ['Reformer at home (app)', '/train/reformer'], ['Live (app)', '/live'], ['Community', '/community'],
  ['Community chat', '/community/chat'], ['Circles', '/community/circles'], ['Clubs', '/community/clubs'],
  ['Nourish', '/nourish'], ['You', '/you'], ['Progress', '/you/progress'], ['Personalise', '/you/personalise'],
  ['Membership and billing', '/you/membership'], ['1-to-1 sessions', '/you/sessions'], ['My coach', '/you/coaching'],
  ['Health check', '/you/health'], ['Devices', '/you/devices'], ['Privacy settings', '/you/privacy'],
];

const shots = []; // { section, name, path, view, file, w, h }
let n = 0;

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // Scroll through so lazy images and reveal animations load, then back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;transition:none!important}' }).catch(() => {});
  await page.waitForTimeout(600);
}

async function shoot(page, section, name, path, view) {
  try {
    const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (path.includes('#studio-members')) await page.locator('[data-answer="yes"]').click().catch(() => {});
    await settle(page);
    const w = page.viewportSize().width;
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    const h = Math.min(full, MAX_H);
    const file = resolve(SHOTS, `${String(++n).padStart(3, '0')}-${view}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 72, fullPage: true, clip: { x: 0, y: 0, width: w, height: h } });
    shots.push({ section, name, path, view, file, w, h, url: page.url().replace(BASE, '') || '/', status: res?.status() });
    console.log('✓', view, path, `${w}×${h}`);
  } catch (e) {
    console.log('✗', view, path, e.message.split('\n')[0]);
  }
}

async function makeMember(page) {
  const cont = () => page.getByRole('button', { name: 'Continue' }).click();
  await page.goto(BASE + '/start/welcome');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await page.waitForURL(/\/start\/name/, { timeout: 20000 });
  await page.getByLabel('First name').fill('Sophie');
  await page.getByLabel(/display name/i).fill('Sophie');
  await page.getByLabel(/18 or over/).check();
  await cont(); await page.waitForURL(/\/start\/goals/);
  await page.getByText('Develop core strength').click(); await page.getByText('Improve posture').click();
  await cont(); await page.waitForURL(/\/start\/experience/);
  await page.getByText('A little').click();
  await cont(); await page.waitForURL(/\/start\/sessions/);
  await cont(); await page.waitForURL(/\/start\/programme/, { timeout: 20000 });
  await page.getByRole('button', { name: 'Start this programme' }).click();
  await page.waitForURL(/\/start\/health/);
  for (const g of await page.locator('[data-health-form] [role="radiogroup"]').all()) await g.getByText('No').click();
  await page.locator('input[name="consent"]').check();
  await page.locator('input[name="agree"]').check();
  await page.locator('input[name="signed_name"]').fill('Sophie Test');
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  await page.waitForURL(/\/start\/account/, { timeout: 20000 });
  await page.locator('#email').fill(`bayse.design+${Date.now()}@example.com`);
  await page.locator('#password').fill(`Design-${Date.now()}-Aa!`);
  await page.locator('input[name="terms"]').check();
  await page.getByRole('button', { name: 'Create my account' }).click();
  await page.waitForURL(/\/join/, { timeout: 20000 });
}

const browser = await chromium.launch();
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const phone = await browser.newContext({ ...devices['iPhone 14'] });
const dp = await desktop.newPage();
const pp = await phone.newPage();

for (const [name, path] of PUBLIC) {
  await shoot(dp, 'Public website', name, path, 'desktop');
  await shoot(pp, 'Public website', name, path, 'phone');
}

// Sign-up journey screens, captured on the phone as members go through them.
const journey = await phone.newPage();
const steps = [['Welcome', '/start/welcome']];
for (const [name, path] of steps) await shoot(journey, 'Sign-up journey', name, path, 'phone');
let memberOk = false;
try {
  await makeMember(dp);
  await shoot(dp, 'Sign-up journey', 'Start your free trial', '/join', 'desktop');
  const skip = dp.getByRole('button', { name: /Test mode · skip payment/ });
  if (await skip.count()) { await skip.click(); await dp.waitForLoadState('networkidle').catch(() => {}); }
  memberOk = true;
} catch (e) {
  console.log('member journey failed:', e.message.split('\n')[0]);
}

if (memberOk) {
  // Same signed-in member on the phone.
  await phone.addCookies(await desktop.cookies());
  for (const [name, path] of MEMBER) {
    await shoot(dp, 'Member app', name, path, 'desktop');
    await shoot(pp, 'Member app', name, path, 'phone');
  }
}
await browser.close();

// ---- PDF ---------------------------------------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
const BAND = 64;
const sections = [...new Set(shots.map((s) => s.section))];
let css = `@page cover { size: 1440px 1018px; margin: 0 }
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,Helvetica,Arial,sans-serif;background:#000;color:#fff}
.cover{page:cover;width:1440px;height:1018px;padding:110px 120px;display:flex;flex-direction:column;justify-content:space-between;break-after:page}
.eyebrow{font-size:14px;letter-spacing:.24em;text-transform:uppercase;color:#9a9a9a}
h1{font-size:112px;line-height:.92;font-weight:800;text-transform:uppercase;letter-spacing:-.02em;margin-top:28px}
.strap{font-size:26px;color:#cfcfcf;margin-top:26px}
.toc{columns:3;column-gap:48px;font-size:15px;line-height:1.7;color:#cfcfcf}
.toc b{display:block;color:#fff;text-transform:uppercase;letter-spacing:.12em;font-size:12px;margin:10px 0 2px;break-after:avoid}
.meta{display:flex;justify-content:space-between;font-size:14px;color:#9a9a9a;border-top:1px solid #333;padding-top:18px}
.shot{break-after:page;background:#000}
.band{height:${BAND}px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid #333;font-size:15px}
.band span{color:#9a9a9a;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.shot img{display:block}
`;
let html = `<section class="cover"><div><p class="eyebrow">Site design · ${esc(date)}</p><h1>The BAYSE<br>Club</h1>
<p class="strap">Pilates, nutrition &amp; personal coaching for women</p></div>
<div class="toc">${sections.map((sec) => `<b>${esc(sec)}</b>${[...new Map(shots.filter((s) => s.section === sec).map((s) => [s.name, s])).values()].map((s) => esc(s.name)).join('<br>')}`).join('')}</div>
<div class="meta"><span>www.thebayseclub.com</span><span>Each page shown on desktop (1440px) and phone (iPhone 14)</span><span>${shots.length} screens</span></div></section>`;
shots.forEach((s, i) => {
  const pw = Math.max(s.w, 390);
  css += `@page p${i}{size:${pw}px ${s.h + BAND}px;margin:0}.p${i}{page:p${i};width:${pw}px}\n`;
  html += `<section class="shot p${i}"><div class="band"><strong>${esc(s.name)}</strong><span>${esc(s.section)} · ${s.view === 'desktop' ? 'Desktop' : 'Phone'} · ${esc(s.path.split('#')[0])}</span></div><img src="file://${s.file}" width="${s.w}" height="${s.h}" alt=""></section>`;
});
const doc = resolve(OUT, 'design.html');
writeFileSync(doc, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
const b2 = await chromium.launch();
const pg = await b2.newPage();
await pg.goto('file://' + doc, { waitUntil: 'load' });
await pg.pdf({ path: resolve(OUT, 'bayse-club-site-design.pdf'), printBackground: true, preferCSSPageSize: true });
await b2.close();
console.log(`PDF: ${shots.length} screens`);
