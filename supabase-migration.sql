-- =============================================================================
-- NEXUS BIM MARKETPLACE - SCRIPT OFFICIEL DE MIGRATION SUPABASE
-- Projet ID: lfndoimqzxvqsosxgeys
-- URL: https://lfndoimqzxvqsosxgeys.supabase.co
-- À exécuter dans : https://supabase.com/dashboard/project/lfndoimqzxvqsosxgeys/sql/new
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLE DES PROFILS UTILISATEURS (MULTI-VENDEURS, CLIENTS, SUPERADMINS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'vendor', 'customer')) DEFAULT 'customer',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  company TEXT,
  specialty TEXT,
  bio TEXT,
  store_slug TEXT UNIQUE,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  contact_email TEXT,
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  is_super_admin BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. TABLE DES BOUTIQUES VENDEURS (PARAMÈTRES ATELIER & COORDONNÉES)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_stores (
  vendor_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  banner_url TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  contact_email TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. TABLE DES PRODUITS NUMÉRIQUES (MAQUETTES BIM, OBJETS 3D, PLUGINS, ETC.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_slug TEXT,
  vendor_avatar TEXT,
  vendor_rating NUMERIC(3,2) DEFAULT 5.0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_free BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  software TEXT NOT NULL,
  product_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  file_format TEXT NOT NULL,
  file_size TEXT NOT NULL,
  version_compatibility TEXT,
  license_type TEXT DEFAULT 'Usage professionnel',
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'pending')) DEFAULT 'published',
  sales_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  download_url TEXT,
  external_link TEXT,
  sample_activation_key TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLE DES COMMANDES CLIENTS (ACHATS MULTI-VENDEURS EN USD)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  platform_fee_percent NUMERIC(5,2) DEFAULT 15.00,
  platform_commission NUMERIC(10,2) DEFAULT 0.00,
  vendor_net_amount NUMERIC(10,2) DEFAULT 0.00,
  payment_method TEXT DEFAULT 'Stripe (Carte Bancaire)',
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'refunded')) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABLE DES LIGNES DE COMMANDES (AVEC ISOLATION VENDEUR)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  vendor_id TEXT,
  vendor_name TEXT,
  vendor_slug TEXT,
  product_title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  download_url TEXT,
  license_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TABLE DES DEMANDES DE RETRAIT & PAIEMENTS VENDEURS (PAYOUTS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  gross_revenue NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payout_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  fee_percent NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  method TEXT NOT NULL,
  account_info TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'processing', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TABLE DES AVIS & ÉVALUATIONS CLIENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. COMPTE SUPER ADMINISTRATEUR PAR DÉFAUT
-- =============================================================================
INSERT INTO public.profiles (
  id, username, email, name, role, company, specialty, is_super_admin, status
) VALUES (
  'usr_super_admin', 'superadmin', 'superadmin@nexusbim.com', 'Super Administrateur', 'super_admin', 'Nexus BIM Core', 'Direction Plateforme & Sécurité', TRUE, 'active'
) ON CONFLICT (email) DO UPDATE SET
  username = 'superadmin',
  role = 'super_admin',
  is_super_admin = TRUE,
  status = 'active';

-- =============================================================================
-- 9. ACTIVATION DU ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. POLITIQUES D'ACCÈS PERMISSIVES POUR APPLICATION CLIENT (ANON / PUBLIC)
-- =============================================================================
DROP POLICY IF EXISTS "Public Full Access Profiles" ON public.profiles;
CREATE POLICY "Public Full Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Vendor Stores" ON public.vendor_stores;
CREATE POLICY "Public Full Access Vendor Stores" ON public.vendor_stores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Products" ON public.products;
CREATE POLICY "Public Full Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Orders" ON public.orders;
CREATE POLICY "Public Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Order Items" ON public.order_items;
CREATE POLICY "Public Full Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Payout Requests" ON public.payout_requests;
CREATE POLICY "Public Full Access Payout Requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Reviews" ON public.reviews;
CREATE POLICY "Public Full Access Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
