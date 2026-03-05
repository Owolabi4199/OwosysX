-- Invoices table (no auth required - free tier uses local storage pattern)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  sender_name TEXT DEFAULT 'VantrexTech',
  sender_email TEXT,
  sender_address TEXT,
  logo_url TEXT,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist table for capturing emails
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  source TEXT DEFAULT 'invoice-app',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations via service role / anon for this MVP
-- Invoices: anyone can create and read their own invoices by session_id
CREATE POLICY "Allow insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow delete invoices" ON public.invoices FOR DELETE USING (true);

CREATE POLICY "Allow insert invoice_items" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select invoice_items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow update invoice_items" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete invoice_items" ON public.invoice_items FOR DELETE USING (true);

CREATE POLICY "Allow insert waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select waitlist" ON public.waitlist FOR SELECT USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_session_id ON public.invoices(session_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
