-- =============================================================================
-- 005_payments_module.sql
--
-- The academy "المدفوعات" (Payments) module: a monthly ledger of income
-- (subscriptions, course fees, donations, awqaf) and expenses (rent, salaries,
-- utilities). Each transaction has an expected amount and a due day, and money
-- arrives over one or more partial entries. Everything here is org-wide finance
-- data, so it is ADMIN-ONLY at the RLS layer.
--
-- Because every write in this app goes straight from the browser/server actions
-- with the anon key, RLS is the ONLY authorization layer — the client-side
-- admin checks are convenience, not security.
--
-- ⚠️  REVIEW AND TEST IN STAGING BEFORE APPLYING TO PRODUCTION.
--     Depends on public.profiles and public.user_roles. Safe to run after (or
--     independently of) 004 — it (re)defines is_admin() idempotently below.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. is_admin() — SECURITY DEFINER so policies can check the admin role without
--    tripping user_roles' own RLS. Redefined here (identical to 004) so this
--    migration is self-contained and does not depend on 004 running first.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- 1. set_updated_at() — generic trigger to keep updated_at fresh on UPDATE.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. payments — one transaction (a payer/source of income, or an expense).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  flow         text NOT NULL CHECK (flow IN ('income', 'expense')),
  kind         text NOT NULL CHECK (kind IN ('fixed', 'variable')),
  category     text NOT NULL,
  expected     numeric NOT NULL CHECK (expected > 0),
  due_day      integer NOT NULL CHECK (due_day BETWEEN 1 AND 28),
  period_year  integer NOT NULL CHECK (period_year BETWEEN 2000 AND 3000),
  period_month integer NOT NULL CHECK (period_month BETWEEN 0 AND 11),
  note         text,
  cancelled    boolean NOT NULL DEFAULT false,
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(period_year, period_month);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments"
ON public.payments FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. payment_entries — the partial payments recorded against a transaction.
--    Their sum is the "paid" amount; expected - paid is what remains.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id  uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount      numeric NOT NULL CHECK (amount > 0),
  day         integer NOT NULL CHECK (day BETWEEN 1 AND 31),
  note        text,
  is_quick    boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_entries_payment ON public.payment_entries(payment_id);

ALTER TABLE public.payment_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payment entries" ON public.payment_entries;
CREATE POLICY "Admins manage payment entries"
ON public.payment_entries FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. payment_events — the human-readable audit timeline ("سجل التعديلات").
--    Append-only in practice; written by the server actions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id  uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  text        text NOT NULL,
  day         integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON public.payment_events(payment_id);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payment events" ON public.payment_events;
CREATE POLICY "Admins manage payment events"
ON public.payment_events FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- 5. DEMO SEED (optional) — populates July 2026 (period_month = 6) so the module
--    matches the design out of the box. Safe to delete this whole section, or
--    remove the rows later from the UI. Guarded so re-running is a no-op.
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.payments WHERE period_year = 2026 AND period_month = 6
  ) THEN
    RAISE NOTICE 'Payments demo seed already present for 2026-07; skipping.';
    RETURN;
  END IF;

  INSERT INTO public.payments (name, flow, kind, category, expected, due_day, period_year, period_month, note, cancelled) VALUES
    ('اشتراك شهري — أسرة أبو بكر',    'income',  'fixed',    'الاشتراكات الشهرية',       500, 1, 2026, 6, NULL,                              false),
    ('اشتراك شهري — أسرة آل ياسين',   'income',  'fixed',    'الاشتراكات الشهرية',       500, 1, 2026, 6, 'وعد بسداد الباقي نهاية الأسبوع',   false),
    ('دعم شهري — الأخ عبد الرحمن',    'income',  'fixed',    'الدعم الشهري من الإخوة',  1000, 2, 2026, 6, NULL,                              false),
    ('رسوم دورة التجويد',              'income',  'variable', 'رسوم الدورات',            4500, 3, 2026, 6, NULL,                              false),
    ('رسوم دورة الفقه',                'income',  'variable', 'رسوم الدورات',            3200, 5, 2026, 6, 'الدفعة الثانية بعد الاختبار',      false),
    ('ريع وقف المكتبة',                'income',  'fixed',    'الأوقاف',                 2500, 4, 2026, 6, NULL,                              false),
    ('تبرع عام — فاعل خير',            'income',  'variable', 'التبرعات',                5000, 5, 2026, 6, 'تبرع موعود يُستلم منتصف الشهر',    false),
    ('اشتراك شهري — أسرة آل سالم',    'income',  'fixed',    'الاشتراكات الشهرية',       500, 6, 2026, 6, NULL,                              false),
    ('دعم شهري — الأخ خالد',          'income',  'fixed',    'الدعم الشهري من الإخوة',   800,12, 2026, 6, NULL,                              false),
    ('رسوم دورة السيرة',              'income',  'variable', 'رسوم الدورات',            2800, 4, 2026, 6, NULL,                              false),
    ('تبرع لكسوة الطلاب',              'income',  'variable', 'التبرعات',                1500, 2, 2026, 6, NULL,                              false),
    ('اشتراك — أسرة آل حامد',          'income',  'fixed',    'الاشتراكات الشهرية',       500, 1, 2026, 6, NULL,                              true),
    ('إيجار المقر',                    'expense', 'fixed',    'الإيجار',                 4000, 1, 2026, 6, NULL,                              false),
    ('مرتبات المعلمات',                'expense', 'fixed',    'مرتبات المعلمات',         6000, 3, 2026, 6, NULL,                              false),
    ('فاتورة الكهرباء',                'expense', 'variable', 'الكهرباء',                 850, 8, 2026, 6, NULL,                              false),
    ('فاتورة المياه',                  'expense', 'variable', 'الماء',                    180, 4, 2026, 6, NULL,                              false),
    ('فاتورة الغاز',                   'expense', 'variable', 'الغاز',                    120, 6, 2026, 6, NULL,                              false),
    ('فاتورة الإنترنت',                'expense', 'fixed',    'الإنترنت',                 400, 2, 2026, 6, NULL,                              false),
    ('اشتراك زوم',                     'expense', 'fixed',    'اشتراك زوم',               300, 1, 2026, 6, NULL,                              false),
    ('اشتراك برنامج البث',             'expense', 'fixed',    'اشتراك برنامج البث',       250, 3, 2026, 6, NULL,                              false),
    ('الكتب الشهرية',                  'expense', 'variable', 'الكتب الشهرية',            900, 4, 2026, 6, NULL,                              false),
    ('دعم الأسر المحتاجة',            'expense', 'variable', 'دعم الأسر المحتاجة',      1500, 5, 2026, 6, 'الباقي يُصرف مع الراتب',           false);

  -- Partial entries. Matched by (name, period) which is unique within the seed.
  INSERT INTO public.payment_entries (payment_id, amount, day, note)
  SELECT p.id, v.amount, v.day, v.note
  FROM (VALUES
    ('اشتراك شهري — أسرة أبو بكر',    500, 1, 'نقدًا'),
    ('اشتراك شهري — أسرة آل ياسين',   300, 1, 'تحويل بنكي'),
    ('رسوم دورة التجويد',            4500, 3, 'تحويل بنكي'),
    ('رسوم دورة الفقه',              1600, 5, 'الدفعة الأولى'),
    ('ريع وقف المكتبة',             2500, 4, 'تحويل'),
    ('رسوم دورة السيرة',            2800, 4, 'نقدًا'),
    ('تبرع لكسوة الطلاب',           1500, 2, 'تحويل'),
    ('إيجار المقر',                 4000, 1, 'تحويل'),
    ('مرتبات المعلمات',             6000, 3, 'تحويل'),
    ('فاتورة المياه',                180, 4, 'سداد'),
    ('فاتورة الإنترنت',              400, 2, 'سداد'),
    ('اشتراك زوم',                   300, 1, 'بطاقة'),
    ('الكتب الشهرية',                900, 4, 'نقدًا'),
    ('دعم الأسر المحتاجة',          1000, 5, 'الدفعة الأولى')
  ) AS v(name, amount, day, note)
  JOIN public.payments p
    ON p.name = v.name AND p.period_year = 2026 AND p.period_month = 6;

  -- Creation events for the audit timeline.
  INSERT INTO public.payment_events (payment_id, text, day)
  SELECT id,
         'إنشاء العملية — المتوقع ' || to_char(expected, 'FM999,999') || ' ج.م',
         1
  FROM public.payments
  WHERE period_year = 2026 AND period_month = 6;

  -- One event per recorded entry.
  INSERT INTO public.payment_events (payment_id, text, day)
  SELECT payment_id,
         'تسجيل دفعة ' || to_char(amount, 'FM999,999') || ' ج.م',
         day
  FROM public.payment_entries e
  WHERE EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = e.payment_id AND p.period_year = 2026 AND p.period_month = 6
  );
END $$;
