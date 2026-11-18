-- Record which version of the terms each member accepted, and when (consent_records keeps a dated row per acceptance).
alter table public.consent_records drop constraint consent_records_purpose_check;
alter table public.consent_records add constraint consent_records_purpose_check check (purpose in (
  'wellness_data', 'dietary_needs', 'health_screening', 'share_wellness_with_coach', 'marketing_email', 'celebrations', 'terms'));
