import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Email validation helper
const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim();
  if (cleanEmail.length > 254) return false;
  // Prevent header injection
  if (/[\r\n]/.test(cleanEmail)) return false;
  // Standard email format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(cleanEmail);
};

// Escape HTML entities to prevent injection in email templates
const escapeHtml = (str: string = ''): string => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Format timestamp in IST (Indian Standard Time)
const formatTimestamp = (dateStr?: string): string => {
  const d = dateStr ? new Date(dateStr) : new Date();
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(d);
  } catch (_) {
    return d.toUTCString();
  }
};

interface EnquiryPayload {
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  artwork_type?: string;
  project_type?: string;
  preferred_metal?: string;
  budget?: string;
  timeline?: string;
  description?: string;
  dimensions?: string;
  reference_images?: string[];
  submitted_at?: string;
  source?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      console.error('[VMW Email Automation] RESEND_API_KEY secret is not configured in Supabase Edge Functions.');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service configuration missing. Please configure RESEND_API_KEY.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: EnquiryPayload = await req.json();

    // Extract & normalize fields
    const customerName = (body.full_name || body.name || '').trim();
    const customerEmail = (body.email || '').trim();
    const customerPhone = (body.phone || body.whatsapp || '').trim();
    const artworkType = (body.artwork_type || body.project_type || 'General Consultation').trim();
    const preferredMetal = (body.preferred_metal || '').trim();
    const budget = (body.budget || '').trim();
    const timeline = (body.timeline || '').trim();
    const description = (body.description || '').trim();
    const dimensions = (body.dimensions || '').trim();
    const submittedTime = formatTimestamp(body.submitted_at);

    // Validation
    if (!customerName || customerName.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Customer name is required (min 2 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize values for safe email rendering
    const safeName = escapeHtml(customerName);
    const safeEmail = escapeHtml(customerEmail || 'Not provided');
    const safePhone = escapeHtml(customerPhone || 'Not provided');
    const safeType = escapeHtml(artworkType);
    const safeMetal = escapeHtml(preferredMetal);
    const safeBudget = escapeHtml(budget);
    const safeTimeline = escapeHtml(timeline);
    const safeDimensions = escapeHtml(dimensions);
    const safeDescription = escapeHtml(description).replace(/\n/g, '<br/>');

    // Build Email 1: Admin Notification HTML
    const adminNotificationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Website Enquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F2EEE6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0B0A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141312; border: 1px solid #2B261F; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.6);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(180deg, #1C1A17 0%, #141312 100%); border-bottom: 1px solid #2B261F; text-align: center;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; font-size: 11px; font-weight: 600; color: #D4AF37; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">
                NEW INQUIRY
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #F2EEE6; letter-spacing: 0.05em;">
                VIJAY METAL WORKS
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #A69F94; font-style: italic;">
                Temple Metal Craftsmanship Since 1915
              </p>
            </td>
          </tr>

          <!-- Summary Banner -->
          <tr>
            <td style="padding: 24px 32px; background-color: #181715; border-bottom: 1px solid #2B261F;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Customer Name</p>
                    <p style="margin: 0; font-size: 18px; color: #D4AF37; font-weight: 700;">${safeName}</p>
                  </td>
                  <td align="right" valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Submitted</p>
                    <p style="margin: 0; font-size: 12px; color: #C2BBB0;">${submittedTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details Grid -->
          <tr>
            <td style="padding: 28px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <tr>
                  <td style="padding-bottom: 16px; width: 40%; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Phone / WhatsApp</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <a href="tel:${safePhone}" style="color: #F2EEE6; font-size: 14px; text-decoration: none; font-weight: 600;">${safePhone}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Email Address</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    ${customerEmail ? `<a href="mailto:${safeEmail}" style="color: #D4AF37; font-size: 14px; text-decoration: none;">${safeEmail}</a>` : `<span style="color: #6E6860; font-size: 14px;">Not provided</span>`}
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Enquiry Type</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="display: inline-block; padding: 3px 10px; background-color: #24221E; border: 1px solid #38342D; border-radius: 4px; color: #F2EEE6; font-size: 13px; font-weight: 600;">${safeType}</span>
                  </td>
                </tr>

                ${preferredMetal ? `
                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Preferred Metal</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top; color: #F2EEE6; font-size: 14px;">
                    ${safeMetal}
                  </td>
                </tr>
                ` : ''}

                ${safeDimensions ? `
                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Dimensions</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top; color: #F2EEE6; font-size: 14px;">
                    ${safeDimensions}
                  </td>
                </tr>
                ` : ''}

                ${budget ? `
                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Budget</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top; color: #F2EEE6; font-size: 14px;">
                    ${safeBudget}
                  </td>
                </tr>
                ` : ''}

                ${timeline ? `
                <tr>
                  <td style="padding-bottom: 16px; vertical-align: top;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Timeline</span>
                  </td>
                  <td style="padding-bottom: 16px; vertical-align: top; color: #F2EEE6; font-size: 14px;">
                    ${safeTimeline}
                  </td>
                </tr>
                ` : ''}

                <tr>
                  <td colspan="2" style="padding-top: 12px; padding-bottom: 8px;">
                    <span style="font-size: 12px; color: #8A847A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Message / Project Details</span>
                    <div style="margin-top: 8px; padding: 16px; background-color: #0E0E0D; border: 1px solid #2B261F; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #E8E2D8;">
                      ${safeDescription || '<em>No additional details provided.</em>'}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Quick Action Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #181715; border-top: 1px solid #2B261F; text-align: center;">
              ${customerPhone ? `
              <a href="https://wa.me/${encodeURIComponent(customerPhone.replace(/[^0-9]/g, ''))}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #D4AF37 0%, #AA8A2A 100%); color: #000000; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase; margin-right: 8px;">
                Reply via WhatsApp
              </a>
              ` : ''}
              ${customerEmail ? `
              <a href="mailto:${safeEmail}" style="display: inline-block; padding: 12px 24px; background-color: transparent; border: 1px solid #D4AF37; color: #D4AF37; font-weight: 600; font-size: 13px; text-decoration: none; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">
                Reply via Email
              </a>
              ` : ''}
              <p style="margin: 20px 0 0 0; font-size: 11px; color: #6E6860;">
                This is an automated notification from the Vijay Metal Works website.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Admin Plain Text
    const adminNotificationText = `
NEW WEBSITE ENQUIRY — VIJAY METAL WORKS

Customer: ${customerName}
Phone / WhatsApp: ${customerPhone || 'Not provided'}
Email: ${customerEmail || 'Not provided'}
Enquiry Type: ${artworkType}
${preferredMetal ? `Preferred Metal: ${preferredMetal}\n` : ''}${dimensions ? `Dimensions: ${dimensions}\n` : ''}${budget ? `Budget: ${budget}\n` : ''}${timeline ? `Timeline: ${timeline}\n` : ''}
Message:
${description || 'No additional details provided.'}

Submitted: ${submittedTime}
--------------------------------------------------
This is an automated notification from the Vijay Metal Works website.
    `.trim();

    // Send Email 1: Admin Notification
    const adminEmailPayload = {
      from: 'Vijay Metal Works <no-reply@vijaymetalworks.com>',
      to: ['admin@vijaymetalworks.com'],
      reply_to: isValidEmail(customerEmail) ? customerEmail : 'admin@vijaymetalworks.com',
      subject: `New Website Enquiry — ${customerName}`,
      html: adminNotificationHtml,
      text: adminNotificationText,
    };

    const emailResponses: { admin?: any; customer?: any; errors?: string[] } = {};
    const errors: string[] = [];

    // Dispatch Admin Email
    try {
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminEmailPayload),
      });

      const adminData = await adminRes.json();
      if (!adminRes.ok) {
        console.error('[VMW Resend Error: Admin Notification]', adminData);
        errors.push(`Admin notification failed: ${adminData.message || adminRes.statusText}`);
      } else {
        emailResponses.admin = adminData;
      }
    } catch (err: any) {
      console.error('[VMW Resend Exception: Admin Notification]', err);
      errors.push(`Admin notification exception: ${err.message || String(err)}`);
    }

    // Build Email 2: Customer Thank-You Email (Only if valid customer email provided)
    if (isValidEmail(customerEmail)) {
      const customerThankYouHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Choosing Vijay Metal Works</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0A; font-family: Georgia, 'Times New Roman', serif; color: #F2EEE6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0B0A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #141312; border: 1px solid #2B261F; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Emblem -->
          <tr>
            <td style="padding: 40px 36px 28px 36px; text-align: center; background: linear-gradient(180deg, #1C1A17 0%, #141312 100%); border-bottom: 1px solid #2B261F;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center" style="width: 48px; height: 48px; border: 1.5px solid #D4AF37; transform: rotate(45deg); padding: 8px;">
                    <span style="display: block; transform: rotate(-45deg); font-family: 'Cinzel', Georgia, serif; font-size: 20px; font-weight: 700; color: #D4AF37; line-height: 1;">V</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-family: 'Cinzel', Georgia, serif; font-size: 20px; font-weight: 700; color: #F2EEE6; letter-spacing: 0.22em; text-transform: uppercase;">
                VIJAY METAL WORKS
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #D4AF37; letter-spacing: 0.12em; font-style: italic;">
                Temple Metal Craftsmanship Since 1915
              </p>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.8; color: #E8E2D8;">
              <p style="margin: 0 0 20px 0; font-size: 17px; color: #F2EEE6; font-weight: 600;">
                Dear ${safeName},
              </p>
              
              <p style="margin: 0 0 20px 0;">
                Thank you for reaching out to <strong style="color: #D4AF37;">Vijay Metal Works</strong>.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #C2BBB0;">
                We truly appreciate your interest and the opportunity to assist you.
              </p>
              
              <div style="margin: 28px 0; padding: 20px; background-color: #1A1916; border-left: 3px solid #D4AF37; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px; color: #E8E2D8; line-height: 1.7;">
                  Your enquiry regarding <strong>${safeType}</strong> has been successfully received by our master craftsmen team. We will review the specifications and get back to you as soon as possible.
                </p>
              </div>

              <p style="margin: 0 0 28px 0;">
                Thank you for choosing Vijay Metal Works.
              </p>
              
              <p style="margin: 0; color: #A69F94; font-size: 14px;">
                Warm regards,
              </p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #D4AF37; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.08em;">
                Vijay Metal Works
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0E0E0D; border-top: 1px solid #2B261F; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A847A; font-weight: 600;">
                Quality &bull; Craftsmanship &bull; Trust
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #A69F94;">
                New No. 3, Old No. 19, Murugappa Street, Sowcarpet, Chennai &ndash; 600 079
              </p>
              <p style="margin: 0; font-size: 11px; color: #6E6860;">
                Direct: +91 93828 77351 &bull; Email: vijaymetalworks4u@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const customerThankYouText = `
Dear ${customerName},

Thank you for reaching out to Vijay Metal Works.

We truly appreciate your interest and the opportunity to assist you.

Your enquiry regarding "${artworkType}" has been successfully received by our team. We will review the details and get back to you as soon as possible.

Thank you for choosing Vijay Metal Works.

Warm regards,

Vijay Metal Works
Quality • Craftsmanship • Trust
Since 1915 — Sowcarpet, Chennai
Phone: +91 93828 77351
Email: vijaymetalworks4u@gmail.com
      `.trim();

      const customerEmailPayload = {
        from: 'Vijay Metal Works <no-reply@vijaymetalworks.com>',
        to: [customerEmail],
        reply_to: 'admin@vijaymetalworks.com',
        subject: 'Thank You for Choosing Vijay Metal Works',
        html: customerThankYouHtml,
        text: customerThankYouText,
      };

      try {
        const custRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerEmailPayload),
        });

        const custData = await custRes.json();
        if (!custRes.ok) {
          console.error('[VMW Resend Error: Customer Thank-You]', custData);
          errors.push(`Customer thank-you email failed: ${custData.message || custRes.statusText}`);
        } else {
          emailResponses.customer = custData;
        }
      } catch (err: any) {
        console.error('[VMW Resend Exception: Customer Thank-You]', err);
        errors.push(`Customer thank-you exception: ${err.message || String(err)}`);
      }
    }

    if (errors.length > 0 && !emailResponses.admin && !emailResponses.customer) {
      return new Response(
        JSON.stringify({
          success: false,
          warning: 'Enquiry recorded but automated email delivery failed.',
          details: errors,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automated enquiry emails processed successfully',
        admin_delivered: Boolean(emailResponses.admin),
        customer_delivered: Boolean(emailResponses.customer),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[VMW Edge Function Unhandled Exception]', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error while processing email automation',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
