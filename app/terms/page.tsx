import { LegalPage } from '@/components/site/LegalPage';
import { AGREEMENT, PARQ } from '@/lib/health/parq';
import { COMPANY, SUPPORT_EMAIL, LEGAL_UPDATED } from '@/lib/site/offer';

export const metadata = { title: 'Terms and conditions' };

// The BAYSE Club Terms & Conditions, version 1 (supplied by BAYSE on 18 Nov 2026, published 19 Nov 2026).
// Company details and the support address come from lib/site/offer.ts.
export default function Terms() {
  return (
    <LegalPage title="The BAYSE Club Terms and Conditions" updated={`${LEGAL_UPDATED} · Version 1 · Effective from ${LEGAL_UPDATED}`}>
      <h2>1. Who supplies The BAYSE Club</h2>
      <p>The BAYSE Club is supplied by Northwest Reformer Pilates Ltd, company number {COMPANY.number}, registered office {COMPANY.office}. In these terms, “BAYSE”, “we” and “us” mean that company. Contact us through the support section of your BAYSE Club account or at <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>. Our <a href="/privacy" className="underline">Privacy Policy</a> explains how we use personal data.</p>
      <p>These terms apply to BAYSE Club memberships, digital content, online classes, private sessions and the member community. Your studio operator’s terms govern any studio membership or in-person bookings.</p>

      <h2>2. Memberships and access</h2>
      <p>The BAYSE Club offers BAYSE Foundation, BAYSE Inner Circle and BAYSE Black. Before you buy, we show the total price, billing frequency, start date, what your plan includes and any limits on live bookings or coaching. Features may include an on-demand Pilates library, live online classes, member community access and personal coaching, depending on your plan.</p>
      <p>BAYSE Black costs £89.99 every 28 days (£44.99 for eligible BAYSE studio members) and includes one 40-minute private Zoom Pilates session per paid billing period, alongside its advertised digital and live benefits. The included session becomes available after your first successful payment, not during a free trial. It must be booked and taken within the paid 28-day period it belongs to: unused sessions do not carry forward, are non-transferable and cannot be exchanged for cash. Book through the method shown in your account. If we cannot offer a reasonable opportunity to use your included session within the applicable period, contact us so we can arrange an alternative or provide any remedy you are entitled to.</p>
      <p>Eligible BAYSE studio members on the £99 or £148 studio memberships receive BAYSE Foundation at no extra charge while their qualifying membership remains active. BAYSE Inner Circle and BAYSE Black are offered to them at the studio member price. This access carries no recurring BAYSE Club charge and ends when eligibility ends. A paid online plan starts only if you actively purchase one. Studio membership includes no complimentary private online sessions. Studio members can book and pay for private sessions separately at the price shown before booking.</p>

      <h2>3. Billing and renewal</h2>
      <p>Your first payment covers the first 28 days. Paid plans renew automatically every 28 days until cancelled. A full year normally includes 13 payments, and some calendar months may contain two payments. Your checkout and confirmation show the total payable per period, including applicable taxes, and your next billing date.</p>
      <p>By completing checkout, you authorise recurring charges to your chosen payment method. Our payment provider may retry a failed payment. We may suspend access after notifying you if a payment remains overdue and will explain how to restore access. If you think a charge is incorrect or duplicated, contact us so we can investigate and correct any error.</p>
      <p>Any trial or introductory offer will show its length, expiry, and any later charge and renewal date before you accept it. Browsing free material or activating studio-included access does not authorise a paid subscription.</p>

      <h2>4. Cancelling a paid membership</h2>
      <p>You can give 28 days’ notice through the cancellation option in your BAYSE Club account or by emailing <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>. Your notice starts when we receive it. We will confirm receipt, any final payment, and the date access ends.</p>
      <p>If your current paid period covers the full notice period, no further payment is due. If your next renewal falls before the notice period ends, we will collect one final full 28-day payment. You keep access and the plan benefits for that full paid period. Your subscription then ends without another renewal.</p>
      <p><strong>Example.</strong> If you give notice on 10 September, your 28-day notice ends on 8 October. If your next payment is due on 20 September, that payment covers 20 September through 17 October inclusive. Your access ends after 17 October.</p>
      <p>The first paid period is subject to your statutory cancellation rights and any other rights to end the contract earlier. If you become unable to use the service because of a significant change in circumstances, contact us so we can consider your request for early cancellation.</p>

      <h2>5. Cooling-off rights</h2>
      <p>When you buy a membership online as a UK consumer, you normally have 14 days to cancel starting the day after you enter the contract. To exercise that right, send us a clear statement through your account or by email before the deadline. You can also use the model cancellation form below.</p>
      <p>If you expressly ask us to start supplying a service during the cooling-off period and then cancel, we may charge a proportionate amount for the service already supplied where the law allows it. The cancellation right for a service can end on full performance where you expressly requested early performance and acknowledged that consequence.</p>
      <p>For digital content such as on-demand videos, an applicable cancellation right for that content can be lost once supply begins, provided you expressly consented to immediate supply, acknowledged the loss of the right and received the required confirmation. Starting a video does not automatically remove rights that apply to other parts of your membership.</p>
      <p>Some standalone leisure bookings for a specific date or time may be exempt from the statutory cooling-off period. The cancellation terms for your booking will be shown before payment. Where a statutory refund is due, we will issue it using your original payment method unless you agree otherwise and within the applicable legal time limit.</p>
      <p><strong>Model cancellation form.</strong> To {COMPANY.name}, {COMPANY.office}, {SUPPORT_EMAIL}: I give notice that I cancel my contract for [membership, content or service]. Ordered on [date]. Name [your name]. Address [your address]. Date [date]. Signature [only if sending on paper].</p>

      <h2>6. Live classes and private bookings</h2>
      <p>Live classes and private sessions are subject to availability. Your booking is confirmed when we send confirmation or display it as confirmed in your account. Booking details show the time, joining instructions and any applicable cancellation or rescheduling window.</p>
      <p>A standalone private online Pilates session lasts 40 minutes. The price for someone without an online membership is £44.99, payable in full when booking. Any member-specific rate is shown before payment.</p>
      <p>You may cancel a separately paid private session at least 12 hours before the scheduled start for a full refund. Later cancellations and missed sessions are generally non-refundable, subject to your legal rights. For included coaching sessions, the booking screen explains how late cancellations and missed sessions affect your entitlement. If BAYSE cannot provide a separately paid session, you can choose a replacement or full refund. For an included session we cancel, we will offer a replacement and preserve the entitlement long enough to use it, or provide any applicable remedy.</p>

      <h2 id="health">7. Using The BAYSE Club safely</h2>
      <p>Use a suitable device, a stable internet connection and a clear exercise space. Follow the instructor’s guidance, select a level appropriate to your experience and use only the equipment specified. Stop if you experience pain, dizziness or feel unwell. Speak to an appropriate healthcare professional if you are unsure whether exercise is suitable, including during pregnancy, after surgery or injury, or if you have a health condition that could affect safe participation.</p>
      <p>Online instructors may have limited visibility, and on-demand sessions are unsupervised. Fitness, wellbeing and any nutrition information are for general guidance. Seek qualified medical advice for individual diagnosis or treatment.</p>
      <p><strong>Health check and health and safety agreement.</strong> Before your first class we ask {PARQ.length} health questions and for your agreement to the points below. If you answer yes to any question, we ask you to get advice from a doctor or qualified health professional before taking part. We ask you to confirm your health check every 12 months.</p>
      <ol>{AGREEMENT.map((a) => <li key={a.title}><strong>{a.title}.</strong> {a.body}</li>)}</ol>

      <h2>8. Your account, content and community</h2>
      <p>Keep your credentials secure and contact support if you suspect unauthorised access. Your account and access to content are for your personal use. You may stream available content while entitled to access it. You may not share passwords or private joining links, redistribute videos or materials, or record or screenshot instructors or other participants without permission. To protect this, a membership can be used on a limited number of devices at once, which you can manage in My BAYSE.</p>
      <p>Treat other members with respect. Harassment, discrimination, threats, spam and sharing another person’s private information without permission are prohibited. You retain ownership of your posts and give BAYSE permission to display them within the service and moderate them for as long as reasonably needed to operate the community. You can report content or conduct through support. BAYSE may remove content or restrict access for serious or repeated breaches and will explain its decision where reasonably practicable.</p>
      <p>Member-led meetups and groups, including padel groups where offered, are arranged by their organisers. Check the organiser’s arrangements, venue rules and any separate costs before attending. BAYSE remains responsible for activities it directly supplies and for any obligations it owes under law.</p>

      <h2>9. Availability, recordings and changes</h2>
      <p>We may update the content library, instructors and timetable. If an interruption or change affects a paid booking or materially reduces a paid service, we will take reasonable steps to restore access, arrange a replacement, or provide any refund or other remedy due.</p>
      <p>If we plan to record a live class, we will explain in advance what is captured, how it will be used and what participation options are available. We will seek consent where required for identifiable recordings and marketing use.</p>
      <p>We will give at least 28 days’ advance notice of a price increase or other materially adverse change wherever reasonably possible. If you choose to cancel before the change takes effect, you can end the membership before the change applies without a further charge arising from the ordinary notice rule. Changes required sooner by law or for an urgent safety or security reason will be communicated as soon as reasonably possible.</p>

      <h2>10. Refunds, complaints and legal rights</h2>
      <p>If we charge you incorrectly or fail to provide a service or digital content as agreed, contact us through your account or at <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>. Depending on the circumstances, your statutory remedies may include repeat performance, repair or replacement, a price reduction or a refund. Ordinary non-use of an available membership does not by itself entitle you to a refund.</p>
      <p>We are responsible for foreseeable loss caused by our breach of these terms or failure to use reasonable care and skill. These terms do not limit liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability or consumer right that the law protects.</p>
      <p>English and Welsh law governs these terms, subject to the mandatory consumer protections and courts available where you live. We will provide your purchase confirmation and the applicable terms by email or another durable format.</p>
    </LegalPage>
  );
}
