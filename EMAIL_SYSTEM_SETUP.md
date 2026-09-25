# Vijay Metal Works — Automated Enquiry Email System

## Overview
When a client submits an enquiry on the Vijay Metal Works website (via the Consultation Form or the Commission Modal):
1. **Client-side validation** validates required fields and email formatting.
2. **Database Record**: The enquiry is saved directly to the existing Supabase `inquiries` table.
3. **Server-Side Edge Function (`send-enquiry-email`)** is triggered securely without ever exposing the Resend API key to client browsers.
4. **Resend Email Service**:
   - **Email 1 (Admin Notification)**: Sent to `admin@vijaymetalworks.com` with formatted details, customer contact info, and direct WhatsApp/Email reply action buttons.
   - **Email 2 (Customer Thank-You)**: Sent to the customer's validated email address with a warm, luxurious Vijay Metal Works greeting and acknowledgement.

---

## 1. Setting the Secret in Supabase

The Resend API key must be saved as an environment secret in your Supabase project.

### Option A: Via Supabase Dashboard (Easiest)
1. Go to your Supabase Project Dashboard: [https://app.supabase.com](https://app.supabase.com)
2. In the left sidebar, navigate to **Project Settings** &rarr; **Edge Functions** (or **Edge Functions** tab in sidebar).
3. Under **Secrets**, click **Add new secret**:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_resend_api_key`
4. Click **Save**.

### Option B: Via Supabase CLI
```bash
npx supabase secrets set RESEND_API_KEY=re_your_actual_resend_api_key --project-ref xsiupjixeiqkfeudiuho
```

---

## 2. Deploying the Supabase Edge Function

The edge function source code is located at:
`supabase/functions/send-enquiry-email/index.ts`

### Deploy with Supabase CLI
```bash
# Login to Supabase CLI (if not logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref xsiupjixeiqkfeudiuho

# Deploy the send-enquiry-email function
npx supabase functions deploy send-enquiry-email --no-verify-jwt
```

---

## 3. Email Specifications

### Admin Notification
- **Recipient**: `admin@vijaymetalworks.com`
- **Sender**: `Vijay Metal Works <no-reply@vijaymetalworks.com>`
- **Subject**: `New Website Enquiry — {{customer_name}}`
- **Reply-To**: Customer's submitted email (allows 1-click email replies)
- **Features**: Complete project specifications, metal preference, dimensions, timeline, direct WhatsApp link.

### Customer Thank-You Email
- **Recipient**: Customer's submitted email address
- **Sender**: `Vijay Metal Works <no-reply@vijaymetalworks.com>`
- **Reply-To**: `vijaymetalworks4u@gmail.com`
- **Subject**: `Thank You for Choosing Vijay Metal Works`
- **Design**: Table-based responsive email layout featuring the VMW golden emblem, Cinzel & Garamond luxury typography, obsidian & warm gold palette, and master craftsmen acknowledgement.

---

## 4. Security & Error Handling
- **Zero Client Exposure**: The Resend API key is never bundled in frontend JavaScript or `.env` files.
- **Fail-Safe Client UX**: If email delivery is delayed or fails on Resend's end, the database enquiry remains securely saved and the customer sees the normal success screen without technical error messages.
- **Duplicate Prevention**: Form submission locks preventing duplicate triggers during React renders or double clicks.
- **Email Injection Protection**: All dynamic user inputs are sanitized (`escapeHtml`) and checked for illegal newline characters before dispatch.
