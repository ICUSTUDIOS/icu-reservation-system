-- ───────────────────────────────────────────────
--  Monthly wallet refresh cron job
--  Runs at 00:05 on the 1st of every month
-- ───────────────────────────────────────────────

-- First, ensure the pg_cron extension is enabled
-- (This may require superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the monthly wallet refresh
SELECT cron.schedule(
  'monthly_wallet_refresh',
  '5 0 1 * *',
  $$
    WITH upd AS (
      UPDATE public.members
      SET    wallet_points = 40
      RETURNING auth_id
    )
    INSERT INTO public.point_ledger (member_id, delta, reason)
    SELECT auth_id, 40, 'monthly_refresh' FROM upd;
  $$
);

-- ───────────────────────────────────────────────
--  Weekly red points reset
--  Runs every Monday at 00:10
-- ───────────────────────────────────────────────
SELECT cron.schedule(
  'reset_weekly_red_points',
  '10 0 * * 1',
  $$ UPDATE public.members SET red_points_week = 0; $$
);

-- ───────────────────────────────────────────────
--  View scheduled jobs (for verification)
-- ───────────────────────────────────────────────
SELECT * FROM cron.job WHERE jobname IN ('monthly_wallet_refresh', 'reset_weekly_red_points');
