// Unit tests for the "next live class" countdown bar. Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upcomingSlots, currentSlot, phaseOf, countdownText, whenLabel, prettyTime, ukDate, type ScheduleRow } from '../../lib/daily/countdown';

const row = (over: Partial<ScheduleRow>): ScheduleRow => ({ class_id: 'a', class_date: '2026-11-23', starts_at: '19:00:00', name: 'Evening Flow', minutes: 40, starts_ts: '2026-11-23T19:00:00+00:00', mine: false, state: 'upcoming', ...over });
const at = (iso: string) => Date.parse(iso);

test('countdown bar: skips finished and cancelled classes and picks the soonest', () => {
  const now = at('2026-11-23T09:06:00Z');
  const slots = upcomingSlots([
    row({ class_id: 'early', starts_at: '07:00:00', starts_ts: '2026-11-23T07:00:00+00:00', state: 'finished' }),
    row({ class_id: 'evening' }),
    row({ class_id: 'noon', starts_at: '12:00:00', starts_ts: '2026-11-23T12:00:00+00:00', state: 'cancelled' }),
    row({ class_id: 'nine', starts_at: '09:00:00', starts_ts: '2026-11-23T09:00:00+00:00', state: 'open', name: 'Morning Mat' }),
  ], now);
  assert.deepEqual(slots.map((s) => s.name), ['Morning Mat', 'Evening Flow']);
  assert.equal(currentSlot(slots, now)?.name, 'Morning Mat');
  assert.equal(phaseOf(slots[0], now), 'on');
});

test('countdown bar: moves on to the next class when one ends, and hides when none are left', () => {
  const slots = upcomingSlots([row({ class_id: 'nine', starts_at: '09:00:00', starts_ts: '2026-11-23T09:00:00+00:00' }), row({})], at('2026-11-23T08:00:00Z'));
  assert.equal(currentSlot(slots, at('2026-11-23T09:39:59Z'))?.time, '09:00:00');
  assert.equal(currentSlot(slots, at('2026-11-23T09:40:00Z'))?.time, '19:00:00');
  assert.equal(currentSlot(slots, at('2026-11-23T19:40:00Z')), null);
});

test('countdown bar: room opens 15 minutes before the start', () => {
  const [s] = upcomingSlots([row({})], at('2026-11-23T10:00:00Z'));
  assert.equal(phaseOf(s, at('2026-11-23T18:44:59Z')), 'upcoming');
  assert.equal(phaseOf(s, at('2026-11-23T18:45:00Z')), 'open');
  assert.equal(phaseOf(s, at('2026-11-23T19:00:00Z')), 'on');
});

test('countdown bar: time left reads clearly at every distance', () => {
  assert.equal(countdownText(36_000), '00:36');
  assert.equal(countdownText(14 * 60_000 + 36_000), '14:36');
  assert.equal(countdownText(2 * 3_600_000 + 14 * 60_000 + 36_000), '02:14:36');
  assert.equal(countdownText(28 * 3_600_000 + 5 * 60_000), '1d 4h 05m');
  assert.equal(countdownText(-5_000), '00:00');
  assert.equal(countdownText(59_001), '01:00');
});

test('countdown bar: day labels use the UK date, including across midnight and summer time', () => {
  const now = at('2026-11-23T23:30:00Z');
  assert.equal(ukDate(now), '2026-11-23');
  assert.equal(ukDate(at('2026-07-01T23:30:00Z')), '2026-07-02'); // 00:30 BST
  const [today] = upcomingSlots([row({ starts_at: '23:45:00', starts_ts: '2026-11-23T23:45:00+00:00' })], now);
  const [tomorrow] = upcomingSlots([row({ class_date: '2026-11-24', starts_at: '07:00:00', starts_ts: '2026-11-24T07:00:00+00:00' })], now);
  const [sat] = upcomingSlots([row({ class_date: '2026-11-28', starts_at: '09:30:00', starts_ts: '2026-11-28T09:30:00+00:00' })], now);
  assert.equal(whenLabel(today, now), 'Today 11:45pm');
  assert.equal(whenLabel(tomorrow, now), 'Tomorrow 7am');
  assert.equal(whenLabel(sat, now), 'Sat 9:30am');
  assert.equal(prettyTime('12:00:00'), '12pm');
});
