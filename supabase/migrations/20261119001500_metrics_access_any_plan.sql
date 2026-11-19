-- "With access now" counted on-demand access, which Foundation no longer has. Count the community
-- instead: every plan, trial, code and studio link includes it.
do $$
declare d text := pg_get_functiondef('public.admin_metrics'::regproc);
begin
  execute replace(d, 'e.entitlement_key = ''on_demand''', 'e.entitlement_key = ''community''');
end $$;
