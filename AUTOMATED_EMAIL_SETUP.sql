-- ====================================================================
-- VIJAY METAL WORKS — AUTOMATED ENQUIRY EMAIL SYSTEM
-- ====================================================================
-- This script ensures the inquiries table has tracking for automated email status.
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- 1. Add email notification tracking column if not already present
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS email_notification_status TEXT DEFAULT 'pending' 
CHECK (email_notification_status IN ('pending', 'sent', 'failed', 'skipped'));

-- 2. Add an index for quick lookup of pending/recent inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_email_status ON public.inquiries (email_notification_status, created_at DESC);

-- 3. Confirm RLS allows anonymous users to insert inquiries while preserving admin control
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone can insert inquiries" 
ON public.inquiries FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage inquiries" ON public.inquiries;
CREATE POLICY "Admins manage inquiries" 
ON public.inquiries FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
