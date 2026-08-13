-- ============================================================
-- Boujee Bazaar — Supabase Security Hardening (RLS + columns)
-- Run in Supabase Dashboard → SQL Editor (as postgres)
-- Safe: only access-control statements. No data is modified.
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ---------- Drop any pre-existing permissive policies ----------
DROP POLICY IF EXISTS "categories_service_write" ON public.categories;
DROP POLICY IF EXISTS "contacts_public_insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts_service_read" ON public.contacts;
DROP POLICY IF EXISTS "contacts_service_write" ON public.contacts;
DROP POLICY IF EXISTS "coupons_public_read" ON public.coupons;
DROP POLICY IF EXISTS "coupons_service_write" ON public.coupons;
DROP POLICY IF EXISTS "custom_designs_service_all" ON public.custom_designs;
DROP POLICY IF EXISTS "customizer_mockups_service_all" ON public.customizer_mockups;
DROP POLICY IF EXISTS "Allow authenticated insert/update on global_faqs" ON public.global_faqs;
DROP POLICY IF EXISTS "Allow public read access on global_faqs" ON public.global_faqs;
DROP POLICY IF EXISTS "homepage_config_service_write" ON public.homepage_config;
DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_service_all" ON public.inquiries;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_public_read" ON public.orders;
DROP POLICY IF EXISTS "orders_service_delete" ON public.orders;
DROP POLICY IF EXISTS "orders_service_update" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated insert/update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "reviews_public_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_service_write" ON public.reviews;
DROP POLICY IF EXISTS "Allow authenticated insert/update on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow public read access on settings" ON public.settings;
DROP POLICY IF EXISTS "users_service_all" ON public.users;
DROP POLICY IF EXISTS "products_service_write" ON public.products;
DROP POLICY IF EXISTS "store_settings_service_write" ON public.store_settings;

-- ---------- Public content: anon + authenticated can read ----------

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (available = true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
CREATE POLICY "product_variants_public_read" ON public.product_variants FOR SELECT TO anon, authenticated USING (is_active = true);

ALTER TABLE public.global_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "global_faqs_public_read" ON public.global_faqs;
CREATE POLICY "global_faqs_public_read" ON public.global_faqs FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "homepage_config_public_read" ON public.homepage_config;
CREATE POLICY "homepage_config_public_read" ON public.homepage_config FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_settings_public_read" ON public.store_settings;
CREATE POLICY "store_settings_public_read" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT TO anon, authenticated USING (true);

-- ---------- Customer private data: owner only (authenticated) ----------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE SELECT (password) ON public.profiles FROM anon, authenticated;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE SELECT (customer_email, customer_phone, shipping_address, notes, razorpay_payment_id) ON public.orders FROM anon;

-- ---------- Admin / service-role only: no anon or authenticated access ----------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.users FROM anon, authenticated;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.inquiries FROM anon, authenticated;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.contacts FROM anon, authenticated;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.coupons FROM anon, authenticated;
ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.custom_designs FROM anon, authenticated;
ALTER TABLE public.customizer_mockups ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.customizer_mockups FROM anon, authenticated;
ALTER TABLE public.product_information ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.product_information FROM anon, authenticated;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.product_faqs FROM anon, authenticated;

-- ---------- Reviews: owners insert; approved reviews are public ----------

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_public_read_approved" ON public.reviews;
CREATE POLICY "reviews_public_read_approved" ON public.reviews FOR SELECT TO anon, authenticated USING (approved = true);
