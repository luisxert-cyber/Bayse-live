-- Prices are confirmed (Foundation £19.99, Inner Circle £39.99, Black £79.99, every 28 days), no longer hypotheses.
update public.plans set is_hypothesis = false where is_hypothesis;
