-- =============================================================================
-- 006_payment_entry_overpay_guard.sql
--
-- Closes the overpayment race in the Payments module. The server actions
-- (lib/payments/actions.ts: addEntry, quickConfirm) read the current entries,
-- compute `remaining = expected - sum(entries)`, check `amount <= remaining`,
-- then INSERT a new entry. That read-check-write is a classic TOCTOU: two
-- concurrent requests against the same transaction can both pass the check and
-- both insert, driving sum(entries) past `expected` (an overpayment that no
-- app-level re-check can fully prevent).
--
-- This migration enforces the invariant `SUM(payment_entries.amount) <= expected`
-- at the database — the only place it can be made race-free. A BEFORE trigger
-- takes a row lock on the parent `payments` row (SELECT ... FOR UPDATE), so
-- concurrent entry writes against the same payment serialize: the second
-- transaction blocks until the first commits, then re-reads the now-updated sum
-- and is rejected if it would overshoot. Equality is allowed, so a quickConfirm
-- entry of exactly the remaining amount still succeeds.
--
-- Defense-in-depth: the existing app-level check stays as the fast, friendly
-- path; this trigger is the backstop that makes the invariant actually hold.
--
-- ⚠️  REVIEW AND TEST IN STAGING BEFORE APPLYING TO PRODUCTION.
--     Depends on public.payments and public.payment_entries (migration 005).
--     Idempotent: safe to re-run. Only affects NEW writes — it does not
--     retroactively reject pre-existing rows that already exceed `expected`.
--
--     App wiring: addEntry/quickConfirm (lib/payments/actions.ts) map Postgres
--     error code 'PT001' to the friendly message "المبلغ أكبر من المتبقي" so the
--     rare race-loser sees the same feedback as the app-level guard.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enforce_payment_not_overpaid() — BEFORE INSERT/UPDATE guard on entries.
--
-- SECURITY DEFINER so the invariant is checked against the true row set,
-- independent of the caller's RLS view, mirroring is_admin() in 005. The
-- parent-row lock is what serializes concurrent inserts and removes the race.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_payment_not_overpaid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expected  numeric;
  v_other_sum numeric;
BEGIN
  -- Lock the parent transaction row so concurrent entry writes on the same
  -- payment run one at a time. The blocked writer re-reads the sum below only
  -- after the holder commits, so it sees the committed total — no TOCTOU window.
  SELECT expected
    INTO v_expected
    FROM public.payments
   WHERE id = NEW.payment_id
   FOR UPDATE;

  IF NOT FOUND THEN
    -- No parent row; let the FK constraint raise the definitive error.
    RETURN NEW;
  END IF;

  -- Sum of all OTHER entries for this payment (exclude the row being updated so
  -- UPDATEs that only change an existing entry's amount are handled correctly).
  SELECT COALESCE(SUM(amount), 0)
    INTO v_other_sum
    FROM public.payment_entries
   WHERE payment_id = NEW.payment_id
     AND id <> NEW.id;

  IF v_other_sum + NEW.amount > v_expected THEN
    RAISE EXCEPTION
      'payment overpayment blocked: entries (%) would exceed expected (%) for payment %',
      v_other_sum + NEW.amount, v_expected, NEW.payment_id
      USING ERRCODE = 'PT001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_entries_no_overpay ON public.payment_entries;
CREATE TRIGGER trg_payment_entries_no_overpay
BEFORE INSERT OR UPDATE OF amount, payment_id ON public.payment_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_not_overpaid();
