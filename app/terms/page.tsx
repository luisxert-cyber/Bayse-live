import { LegalPage } from '@/components/site/LegalPage';
export const metadata = { title: 'Terms' };
export default function Terms() {
  return (
    <LegalPage title="Terms of membership" updated="18 November 2026">
      <h2>Membership and trials</h2>
      <p>Paid memberships renew monthly until cancelled. Where a free trial is offered, you will not be charged if you cancel before it ends. You can cancel at any time from You → Membership; cancellation takes effect at the end of the current billing period.</p>
      <h2>Studio members</h2>
      <p>If your BAYSE studio membership includes digital access, it is switched on once your studio confirms your membership, and you will not be charged twice for it.</p>
      <h2>Training safely</h2>
      <p>Exercise carries some risk. Remote instruction cannot replace an in-person assessment. Check with a qualified professional before starting if you are pregnant, recovering from injury or have a medical condition, and stop if anything hurts.</p>
      <h2>Community</h2>
      <p>The community and member-organised Clubs are for adults (18+). Members organise their own activities and meet at public venues; BAYSE provides the platform and moderation but does not run or supervise member activities. Our community guidelines apply.</p>
    </LegalPage>
  );
}
