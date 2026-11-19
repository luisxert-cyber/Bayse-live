import Link from 'next/link';

/** Photo banner for the community, with real numbers (shown only when there is something to show). */
export function CommunityHero({ circles, upcoming }: { circles: number; upcoming: number }) {
  return (
    <div className="overflow-hidden rounded-card bg-ink text-bg">
      <div className="grid max-h-[420px] grid-cols-[1.5fr_1fr] gap-1 overflow-hidden">
        <img src="/images/community-selfie.webp" alt="BAYSE members laughing together after a class" className="aspect-[4/3] h-full w-full object-cover" style={{ objectPosition: '50% 45%' }} />
        <div className="grid gap-1">
          <img src="/images/community-studio-sign.webp" alt="BAYSE members in front of the BAYSE sign" className="h-full w-full object-cover" style={{ objectPosition: '50% 35%' }} />
          <img src="/images/community-friends.webp" alt="BAYSE members together in the studio" className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="p-4">
        <p className="font-display text-xl font-extrabold uppercase leading-tight">The best part of BAYSE happens after class</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/community/circles" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">{circles ? `${circles} Circles to join` : 'Find a Circle'} →</Link>
          <Link href="/community/clubs" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">{upcoming ? `${upcoming} upcoming in Clubs` : 'Padel, walks & socials'} →</Link>
        </div>
      </div>
    </div>
  );
}
