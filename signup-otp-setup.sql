-- Run this once in the Supabase SQL editor to enable Signup Email OTP Verification (Brevo).

CREATE TABLE IF NOT EXISTS signup_otps (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Only the service-role (admin) client touches this table; block anon/authenticated access.
ALTER TABLE signup_otps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON signup_otps FROM anon, authenticated;
