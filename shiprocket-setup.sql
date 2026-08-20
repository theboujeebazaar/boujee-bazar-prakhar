-- Shiprocket integration: adds structured shipping-address columns (needed
-- because Shiprocket's order API wants city/state/pincode as separate
-- fields, not one combined address line) plus columns to track the
-- Shiprocket order/shipment/AWB against each of our orders.
--
-- Run this once in the Supabase SQL editor.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_street TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'India';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_status TEXT;
