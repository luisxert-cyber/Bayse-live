import { LegalPage } from '@/components/site/LegalPage';

export const metadata = { title: 'Privacy policy' };

// The BAYSE Club Privacy Policy (draft supplied by BAYSE on 18 Nov 2026). Two short additions describe features the
// platform already has: the required health check before classes, and the device limit. Both are marked in the code.
const ROWS: [string, string, string][] = [
  ['Your name, email, sign-in details, profile and onboarding answers such as your Pilates experience and workout preferences', 'Set up and manage your account, deliver your membership and personalise your experience', 'Contract'],
  ['Your membership, bookings, attendance and activity in the app, such as workouts completed', 'Provide on-demand workouts, live classes and coaching, record progress and send account or booking updates', 'Contract'],
  ['Your billing details, payment status, transactions, refunds and invoices', 'Process payments through Stripe and manage your subscription. Keep records for tax and accounting', 'Contract and legal obligation'],
  ['Your studio membership status and account identifiers, supplied by the BAYSE studio operator or matched against information you give us', 'Verify and maintain access included with an eligible BAYSE studio membership', 'Legitimate interests in delivering and verifying the studio member benefit'],
  ['Your display name, profile photo if added, posts, comments, group activity and reports', 'Run the member community and moderate content, investigate reports and protect members', 'Contract for community features. Legitimate interests in keeping the community safe'],
  ['Your messages to support or your instructor, and session details such as your display name, camera or microphone feed if enabled, and chat if used', 'Answer enquiries, respond to support requests and deliver live classes or private sessions', 'Contract for member support and sessions. Legitimate interests in responding to general enquiries'],
  ['Technical information such as your IP address, device and browser type, sign-in activity and error logs', 'Keep the app secure, prevent misuse and diagnose faults', 'Legitimate interests in operating and protecting the service'],
  ['Your email address and marketing preferences', 'Send offers you agree to receive and record your choices', 'Consent for optional marketing. Legitimate interests in keeping a record of your opt-out'],
  ['Optional analytics information, such as screens visited or interactions with the app', 'Understand how members use the service and identify improvements', 'Consent where we ask to use optional analytics'],
];

export default function Privacy() {
  return (
    <LegalPage title="The BAYSE Club Privacy Policy" updated="[Publication date]">
      <h2>Who is responsible for your information?</h2>
      <p>Northwest Reformer Pilates Ltd, trading as The BAYSE Club, is the data controller for the personal information covered by this policy. This policy applies to the BAYSE Club app and website, including your account, on-demand workouts, live classes, private coaching and the member community. For questions or to exercise your privacy rights, contact BAYSE and mention The BAYSE Club. We handle your personal information under applicable UK data protection law, including the UK GDPR and the Data Protection Act 2018. The BAYSE studio privacy policy explains how BAYSE handles information about in-studio services.</p>

      <h2>What we collect and why</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border border-stone text-left text-sm">
          <thead><tr className="text-xs uppercase tracking-[0.06em] text-muted"><th className="p-2 font-normal">Information</th><th className="p-2 font-normal">How we use it</th><th className="p-2 font-normal">Our lawful basis</th></tr></thead>
          <tbody>{ROWS.map(([a, b, c]) => <tr key={a} className="border-t border-stone align-top"><td className="p-2">{a}</td><td className="p-2">{b}</td><td className="p-2">{c}</td></tr>)}</tbody>
        </table>
      </div>
      <p>We get information from you, from your use of the app and, where applicable, from Stripe and the BAYSE studio operator that provides your membership. We need certain account and payment details to set up a paid membership. Without those details, we may be unable to create your account or process your subscription.</p>

      <h2>Health information and private sessions</h2>
      {/* Addition: the required health check (PAR-Q) before classes. */}
      <p>Before your first class we ask you to complete a short health check (yes or no questions about your health) and to agree to our health and safety terms. We use your answers to help keep you safe when exercising, and we ask for your explicit consent before storing them. Your answers can be seen only by you and BAYSE’s administrators. If you book a private session, your instructor is told only whether you have told us about a health condition, so they can ask you about it; they do not see your answers. Other members and advertisers never see this information. We ask you to confirm the health check every 12 months and keep each dated record while your account is open, and afterwards only where needed for a legal claim.</p>
      <p>If you choose to share information about an injury, pregnancy, a medical condition or another health consideration through a private screening or coaching form, we use it to discuss suitable exercises or adaptations. We ask for your explicit consent before using this information for that purpose. You can withdraw it at any time through our contact form. Withdrawal applies to future use and may affect the guidance we can offer. We share relevant details with the instructor supporting you where needed for that purpose.</p>
      <p>When you join a live group class, other participants may see your display name and video, hear you if your microphone is enabled, and read messages you share with the group. Private coaching takes place on Zoom. If a session is to be recorded, we explain the purpose, lawful basis, viewers and retention period before recording begins.</p>

      <h2>Payments, service providers and community visibility</h2>
      <p>Stripe handles card payments. The BAYSE Club receives payment and subscription information such as transaction status, amounts and renewal dates. Stripe handles full card details through its payment service. Read <a href="https://stripe.com/gb/privacy" className="underline">Stripe’s privacy policy</a>.</p>
      <p>We share information as needed with instructors and providers that help us run the app, including Netlify for hosting, Supabase for accounts and data storage, Zoom for video sessions, and providers of transactional email or video delivery. We may also share relevant information with our accountants, professional advisers or authorities where needed for their work or required by law.</p>
      <p>Your display name, profile photo if added and contributions in the community can be visible to other members with access to the area where you share them. Use our private contact or coaching channels for health information.</p>

      <h2>International transfers</h2>
      <p>Some providers may store or access personal information outside the UK. Where UK data protection law requires safeguards, we use a UK adequacy regulation or contractual safeguards such as the UK International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses, as applicable. You can contact us for details of the safeguards that apply to your information.</p>

      <h2>How we protect your information</h2>
      <p>We use technical and organisational measures to protect personal information and limit access to people who need it to provide, support or protect the service.</p>

      <h2>How long we keep information</h2>
      <p>We keep account, booking and workout records while needed to provide your membership. After closure, we keep only information needed for a specific purpose such as accounting, responding to unresolved requests, security or legal claims. We determine how long to keep it by considering the reason it was collected, applicable legal requirements and any ongoing dispute.</p>
      <p>We review health information against the coaching or safety purpose for which it was collected and retain it only while needed for that purpose, unless a separate lawful reason applies. When you unsubscribe from marketing, we may keep a record of your opt-out so we can honour it. When information is no longer needed, we delete it or anonymise it where appropriate.</p>

      <h2>Cookies and messages</h2>
      <p>We use essential cookies and similar browser storage for functions such as signing in and keeping your session secure. {/* Addition: device limit. */}This includes a random device identifier that lets us limit how many devices can use one membership; it is not used for advertising or tracking. Where consent is required for optional analytics or advertising technologies, we ask before using them. If the app uses optional tracking that requires consent, you can review your choices and withdraw consent through the cookie controls.</p>
      <p>You can unsubscribe from marketing using the link in our emails or by contacting us. You will still receive service messages about your account, payments and bookings.</p>

      <h2>Your privacy rights</h2>
      <p>You can ask to access your personal information, correct it, erase it, restrict its use or receive a portable copy where these rights apply. You can withdraw consent at any time where we rely on it.</p>
      <p>You can object to direct marketing at any time. You can also object to processing based on legitimate interests.</p>

      <h2>Updating or deleting your information</h2>
      <p>You can update the account details available to you in the app. For help or to request account deletion, contact BAYSE and mention The BAYSE Club. We may need to verify your identity before acting on a request. We explain if we need to retain information for a lawful reason, such as accounting obligations or an ongoing legal claim. Withdrawing consent does not affect processing that was lawful before you withdrew it.</p>

      <h2>Complaints</h2>
      <p>If you have a concern about how we handle your information, contact BAYSE. You can also complain to the <a href="https://ico.org.uk/make-a-complaint/" className="underline">Information Commissioner’s Office</a>.</p>
    </LegalPage>
  );
}
