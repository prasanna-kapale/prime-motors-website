-- =====================================================
-- PRIME MOTORS — Supabase Schema v3
-- Run entirely in SQL Editor
-- =====================================================

-- ── CARS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cars (
  id             BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand          TEXT          NOT NULL,
  model          TEXT          NOT NULL,
  year           INTEGER       NOT NULL CHECK (year BETWEEN 1990 AND 2030),
  price          NUMERIC(10,2) NOT NULL CHECK (price > 0),
  km             TEXT          NOT NULL DEFAULT 'N/A',
  fuel           TEXT          NOT NULL DEFAULT 'Petrol',
  trans          TEXT          NOT NULL DEFAULT 'Automatic',
  color          TEXT          NOT NULL DEFAULT '',
  owner          TEXT          NOT NULL DEFAULT '1st Owner',
  images         JSONB         NOT NULL DEFAULT '[]',
  status         TEXT          NOT NULL DEFAULT 'available'
                               CHECK (status IN ('available','sold')),
  -- ADMIN-ONLY: never shown on public site
  business_type  TEXT          NOT NULL DEFAULT 'owned'
                               CHECK (business_type IN ('owned','consignment')),
  buy_price      NUMERIC(10,2) DEFAULT NULL,
  brokerage      NUMERIC(10,2) DEFAULT NULL,
  broker_name    TEXT          NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cars_updated_at ON public.cars;
CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── INVOICES ──────────────────────────────────────────
-- Matches exact Delivery Note Cum Intermediator Receipt format
CREATE TABLE IF NOT EXISTS public.invoices (
  id                    BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sr_no                 TEXT          NOT NULL UNIQUE,
  sale_date             DATE          NOT NULL DEFAULT CURRENT_DATE,
  sale_time             TEXT          NOT NULL DEFAULT '',
  -- linked car (nullable = manual invoice without inventory car)
  car_id                BIGINT        REFERENCES public.cars(id) ON DELETE SET NULL,
  -- vehicle details (auto-filled from car, manually overrideable)
  registered_owner      TEXT          NOT NULL DEFAULT '',
  owner_so              TEXT          NOT NULL DEFAULT '',
  owner_ro              TEXT          NOT NULL DEFAULT '',
  reg_no                TEXT          NOT NULL DEFAULT '',
  model_name            TEXT          NOT NULL DEFAULT '',
  class_of_vehicle      TEXT          NOT NULL DEFAULT '',
  makers_name           TEXT          NOT NULL DEFAULT '',
  chassis_no            TEXT          NOT NULL DEFAULT '',
  date_of_registration  TEXT          NOT NULL DEFAULT '',
  engine_no             TEXT          NOT NULL DEFAULT '',
  type_of_body          TEXT          NOT NULL DEFAULT '',
  colour                TEXT          NOT NULL DEFAULT '',
  other_info            TEXT          NOT NULL DEFAULT '',
  -- financials
  total_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount_words    TEXT          NOT NULL DEFAULT '',
  advance               NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance               NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- multiple payment rows [{mode, amount, ref_no}]
  payments              JSONB         NOT NULL DEFAULT '[]',
  -- dealer info
  through_dealer        TEXT          NOT NULL DEFAULT '',
  shop_name             TEXT          NOT NULL DEFAULT '',
  dealer_mobile         TEXT          NOT NULL DEFAULT '',
  -- seller details
  seller_name           TEXT          NOT NULL DEFAULT '',
  seller_so             TEXT          NOT NULL DEFAULT '',
  seller_address        TEXT          NOT NULL DEFAULT '',
  seller_mobile         TEXT          NOT NULL DEFAULT '',
  -- purchaser details
  purchaser_name        TEXT          NOT NULL DEFAULT '',
  purchaser_so          TEXT          NOT NULL DEFAULT '',
  purchaser_address     TEXT          NOT NULL DEFAULT '',
  purchaser_mobile      TEXT          NOT NULL DEFAULT '',
  -- ADMIN-ONLY: never shown in printed invoice
  brokerage             NUMERIC(10,2) DEFAULT NULL,
  broker_name           TEXT          NOT NULL DEFAULT '',
  admin_notes           TEXT          NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── LEADS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id             BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  car_id         BIGINT      REFERENCES public.cars(id) ON DELETE SET NULL,
  brand          TEXT        NOT NULL DEFAULT '',
  model          TEXT        NOT NULL DEFAULT '',
  price          NUMERIC     NOT NULL DEFAULT 0,
  source         TEXT        NOT NULL
                 CHECK (source IN (
                   'whatsapp_card','whatsapp_detail','whatsapp_banner',
                   'whatsapp_inquiry','call_card','call_detail','manual'
                 )),
  customer_name  TEXT        NOT NULL DEFAULT '',
  customer_phone TEXT        NOT NULL DEFAULT '',
  notes          TEXT        NOT NULL DEFAULT '',
  -- lead_status: track follow-up state
  lead_status    TEXT        NOT NULL DEFAULT 'New'
                 CHECK (lead_status IN ('New','Contacted','Closed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration: Add columns if table already exists (run if upgrading)
-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_status TEXT NOT NULL DEFAULT 'New' CHECK (lead_status IN ('New','Contacted','Closed'));
-- UPDATE public.leads SET source='whatsapp_inquiry' WHERE source NOT IN ('whatsapp_card','whatsapp_detail','whatsapp_banner','whatsapp_inquiry','call_card','call_detail','manual');

CREATE INDEX IF NOT EXISTS idx_leads_car_id  ON public.leads(car_id);
CREATE INDEX IF NOT EXISTS idx_leads_source  ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_status   ON public.cars(status);

-- ── RLS ───────────────────────────────────────────────
ALTER TABLE public.cars     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read available cars"  ON public.cars;
DROP POLICY IF EXISTS "Anon full access cars"       ON public.cars;
DROP POLICY IF EXISTS "Anon full access invoices"   ON public.invoices;
DROP POLICY IF EXISTS "Anon insert leads"           ON public.leads;
DROP POLICY IF EXISTS "Anon read leads"             ON public.leads;

CREATE POLICY "Public read available cars"
  ON public.cars FOR SELECT USING (status = 'available');
CREATE POLICY "Anon full access cars"
  ON public.cars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access invoices"
  ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon insert leads"
  ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon read leads"
  ON public.leads FOR SELECT USING (true);

-- ── STORAGE ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images','car-images',true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete car images" ON storage.objects;

CREATE POLICY "Public read car images"
  ON storage.objects FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "Anon upload car images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-images');
CREATE POLICY "Anon delete car images"
  ON storage.objects FOR DELETE USING (bucket_id = 'car-images');
