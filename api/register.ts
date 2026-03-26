import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RegisterBody {
  email: string;
  name?: string;
}

function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body as RegisterBody;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const verifyCode = generateVerifyCode();
  const verifyToken = Buffer.from(`${email}:${verifyCode}`).toString('base64');

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">OpenClaw Agent Monitor</h1>
        <p style="color: #666; margin-top: 8px;">Email Verification</p>
      </div>
      <div style="background: #f9fafb; border-radius: 16px; padding: 32px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin: 0 0 24px;">Your verification code:</p>
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #2563eb; margin: 24px 0;">
          ${verifyCode}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          This code will expire in 10 minutes.
        </p>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'OpenClaw <noreply@yourdomain.com>',
          to: email,
          subject: 'Verify your email - OpenClaw Agent Monitor',
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend error:', error);
        return res.status(500).json({ error: 'Failed to send verification email' });
      }
    } catch (error) {
      console.error('Email send error:', error);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
  } else {
    console.log(`[DEV] Verification code for ${email}: ${verifyCode}`);
  }

  return res.status(200).json({
    success: true,
    token: verifyToken,
    message: RESEND_API_KEY ? 'Verification code sent' : 'Verification code logged to console (RESEND_API_KEY not set)',
  });
}
