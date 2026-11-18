// Plain DOM behaviour for the phone tour: dots, caption, arrows, gentle autoplay.
// Swiping itself is native CSS scroll-snap, so it works even before this runs.
export function initPhoneTour(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-track]');
  if (!track || root.dataset.ready) return () => {};
  root.dataset.ready = '1';
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot]'));
  const caption = root.querySelector<HTMLElement>('[data-caption]');
  const labels: string[] = JSON.parse(root.dataset.labels || '[]');
  const count = dots.length;
  let current = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const go = (i: number) => track.scrollTo({ left: ((i + count) % count) * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  const update = () => {
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (i === current && caption?.textContent) return;
    current = i;
    dots.forEach((d, j) => {
      const on = j === i;
      d.setAttribute('aria-current', String(on));
      d.style.width = on ? '20px' : '6px';
      d.style.backgroundColor = on ? '#fff' : 'rgba(255,255,255,0.3)';
    });
    if (caption) caption.textContent = labels[i] ?? '';
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

  let raf = 0;
  const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
  track.addEventListener('scroll', onScroll, { passive: true });
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach((e) => track.addEventListener(e, stop, { passive: true }));
  dots.forEach((d, j) => d.addEventListener('click', () => { stop(); go(j); }));
  root.querySelector('[data-prev]')?.addEventListener('click', () => { stop(); go(current - 1); });
  root.querySelector('[data-next]')?.addEventListener('click', () => { stop(); go(current + 1); });
  if (!reduce) timer = setInterval(() => go(current + 1), 4200);
  update();
  return () => { stop(); track.removeEventListener('scroll', onScroll); };
}
