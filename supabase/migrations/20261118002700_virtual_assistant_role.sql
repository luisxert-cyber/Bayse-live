-- New staff role: virtual assistant. (A new enum value must be committed before it can be used, so the rules live in the next migration.)
alter type public.app_role add value if not exists 'virtual_assistant';
