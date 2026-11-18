import { LegalPage } from '@/components/site/LegalPage';
export const metadata = { title: 'Privacy notice' };
export default function Privacy() {
  return (
    <LegalPage title="Privacy notice" updated="18 November 2026">
      <p>This notice explains what BAYSE collects when you use the BAYSE online platform, why, and the choices you have.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, display name, email and password (stored securely by our authentication provider).</li>
        <li>Your training answers: goals, experience, equipment, availability and preferences, used to recommend a programme.</li>
        <li>Membership and billing: your plan and payment status. Card details are handled by Stripe; we never see your full card number.</li>
        <li>Studio link: the BAYSE studio and membership you tell us about, so your studio can confirm it.</li>
        <li>Optional health information, only with your explicit permission: women&rsquo;s wellness interests, and allergies or intolerances.</li>
      </ul>
      <h2>Health information</h2>
      <p>Wellness interests and allergies are special category data. We only store them after you tick a box to give permission. Only you can see them: not BAYSE staff, not coaches and not other members, unless you choose to share with a coach. Withdrawing permission deletes them straight away.</p>
      <h2>Your rights</h2>
      <ul>
        <li>Download everything we hold about you from You → Privacy and your data.</li>
        <li>Change your answers at any time.</li>
        <li>Delete your account, which removes your data and cancels any subscription.</li>
      </ul>
      <h2>Who we share with</h2>
      <p>Our service providers: Supabase (database and accounts, UK region), Stripe (payments), Netlify (hosting), and later Mux (video), Zoom (live classes) and an email provider. We do not sell your data or share it with advertisers.</p>
      <h2>Contact</h2>
      <p>Questions about your data: contact the BAYSE team through baysereformerpilates.com.</p>
    </LegalPage>
  );
}
