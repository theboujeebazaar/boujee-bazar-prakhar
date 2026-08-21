-- Self-contained migration: creates product_variants / product_images if they don't
-- already exist (matches missing-tables.sql), then adds the color->image link column.
-- Safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stores the admin's "Metal Tone Variations" chip picker (name + hex per tone) as JSON: [{"name":"Rose Gold","hex":"#c5a880"}]
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_swatches TEXT;

-- Color options for a product ("Color Options" editor in the admin product page)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product gallery images ("Product Images" editor in the admin product page)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tags each product_images row with a color name from the product's "Product Colors"
-- chip list (color_swatches), so the storefront can swap the gallery to that color's
-- photos when it's selected. A NULL color_name means the image is shared/general.
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_name TEXT;
CREATE INDEX IF NOT EXISTS idx_product_images_color_name ON product_images(color_name);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Allow the site (anon/public read + service-role writes via the admin panel) to use these tables.
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read product_variants" ON product_variants;
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product_images" ON product_images;
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
