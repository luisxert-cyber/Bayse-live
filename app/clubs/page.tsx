import { redirect } from 'next/navigation';

// The community has its own page now. Old links to /clubs still work.
export default function ClubsPage() {
  redirect('/the-community');
}
