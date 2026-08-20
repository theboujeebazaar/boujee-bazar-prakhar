-- Run this once in the Supabase SQL editor to enable Forgot/Reset Password (Brevo email flow).

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_email_idx ON password_reset_tokens (email);

-- Only the service-role (admin) client touches this table; block anon/authenticated access.
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON password_reset_tokens FROM anon, authenticated;
