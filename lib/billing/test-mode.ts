// TEMPORARY, for testing before payments are switched on.
// While the "test_mode" feature flag is on (Admin → Feature flags), the membership screen (/join)
// shows a "Test mode" button to EVERYONE with an account. Tapping it gives that account full access
// (the same as BAYSE Black) for a few days, with no card and no payment. The access is given by the
// database function start_test_access(), which does nothing once the flag is off.
// Switch the flag off BEFORE real members are invited.
export const TEST_MODE_FLAG = 'test_mode';

/** How long access given by the test-mode button lasts (set in start_test_access). It then ends by itself. */
export const TEST_MODE_DAYS = 7;
