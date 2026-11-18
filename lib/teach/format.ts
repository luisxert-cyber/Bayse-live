// Shared formatting for staff, instructor and 1-to-1 screens. UK time throughout.
import { publicEnv } from '@/lib/env';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const money = (pence: number | null | undefined) => `£${((pence ?? 0) / 100).toFixed(2)}`;

export const ukDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const ukDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', year: 'numeric' });
export const ukTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
export const ukDayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Europe/London' });

export const STATUS: Record<string, string> = {
  requested: 'Waiting for instructor',
  confirmed: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  late_cancelled: 'Cancelled late (lost)',
  completed: 'Completed',
  no_show: 'No-show',
};
export const PAYMENT: Record<string, string> = {
  unpaid: 'Awaiting payment',
  paid: 'Paid',
  credit: 'Personal Coaching credit',
  refund_due: 'Refund due',
  refunded: 'Refunded',
  none: 'No charge',
};

export const ROLE_LABEL: Record<string, string> = {
  instructor: 'Instructor',
  moderator: 'Moderator',
  studio_manager: 'Studio manager',
  virtual_assistant: 'Virtual assistant',
  admin: 'Admin',
  super_admin: 'Owner',
};

export const photoUrl = (path: string) =>
  path.startsWith('http') ? path : `${publicEnv.supabaseUrl}/storage/v1/object/public/instructor-photos/${path}`;

export const STUDIOS = ['Altrincham', 'Bolton', 'Liverpool', 'Stockton Heath', 'Stafford', 'Stoke', 'Wilmslow', 'Chester', 'Harrogate', 'Online only'];
export const SPECIALITIES = ['Mat Pilates', 'Reformer', 'Pre and postnatal', 'Beginners', 'Strength and sculpt', 'Mobility', 'Injury rehab', 'Core and posture', 'Over 60s'];

export const input = 'w-full border border-stone bg-bg px-3 py-2 text-sm';
export const btn = 'inline-flex min-h-[40px] items-center justify-center border border-white px-4 text-xs font-bold uppercase tracking-[0.04em] hover:bg-white hover:text-black disabled:opacity-50';
export const btnSolid = 'inline-flex min-h-[40px] items-center justify-center bg-white px-4 text-xs font-bold uppercase tracking-[0.04em] text-black hover:opacity-90 disabled:opacity-50';
