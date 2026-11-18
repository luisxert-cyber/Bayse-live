// TEMPORARY, for testing before payments are switched on.
// While this is true, the membership screen (/join) shows a "Test mode" button to EVERYONE with an
// account. Tapping it gives that account full access (the same as BAYSE Black) for a few days,
// with no card and no payment.
// Set this to false, or delete the button, BEFORE real members are invited.
export const TEST_MODE_BYPASS = true;

/** How long access given by the test-mode button lasts. It then ends by itself. */
export const TEST_MODE_DAYS = 7;
