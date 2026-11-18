-- Instructor onboarding: the contact and pay details BAYSE needs before an instructor teaches.
-- Private: only the instructor themself and admins can read them (not virtual assistants or moderators).
create table public.instructor_details (
  instructor_id       uuid primary key references public.instructors (id) on delete cascade,
  full_name           text not null check (char_length(full_name) between 2 and 120),
  phone               text not null check (char_length(phone) between 7 and 30),
  address_line1       text not null check (char_length(address_line1) between 2 and 120),
  address_line2       text check (char_length(address_line2) <= 120),
  city                text not null check (char_length(city) between 2 and 80),
  postcode            text not null check (char_length(postcode) between 4 and 10),
  bank_account_name   text not null check (char_length(bank_account_name) between 2 and 120),
  bank_sort_code      text not null check (bank_sort_code ~ '^[0-9]{6}$'),
  bank_account_number text not null check (bank_account_number ~ '^[0-9]{8}$'),
  emergency_name      text check (char_length(emergency_name) <= 120),
  emergency_phone     text check (char_length(emergency_phone) <= 30),
  insurance_provider  text check (char_length(insurance_provider) <= 120),
  insurance_expires   date,
  self_employed       boolean not null default false,
  completed_at        timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
alter table public.instructor_details enable row level security;
create policy instructor_details_read on public.instructor_details for select to authenticated
  using (instructor_id = public.my_instructor_id() or public.is_admin());
create policy instructor_details_insert on public.instructor_details for insert to authenticated
  with check (instructor_id = public.my_instructor_id());
create policy instructor_details_update on public.instructor_details for update to authenticated
  using (instructor_id = public.my_instructor_id()) with check (instructor_id = public.my_instructor_id());
