import { LegalPage } from '@/components/site/LegalPage';
export const metadata = { title: 'Community guidelines' };
export default function Guidelines() {
  return (
    <LegalPage title="Community guidelines" updated="18 November 2026">
      <ul>
        <li>Be kind. Encourage, never compare bodies or weights.</li>
        <li>Keep it safe: meet at public places, and never share your home address or someone else&rsquo;s details.</li>
        <li>No selling, spam or medical advice. Share experiences, not diagnoses.</li>
        <li>Respect privacy. What is shared in a Circle stays in the Circle.</li>
        <li>Report anything that worries you. Our moderators review reports and can remove content or restrict accounts.</li>
      </ul>
    </LegalPage>
  );
}
