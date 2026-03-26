import type { VercelRequest, VercelResponse } from '@vercel/node';

interface VerifyBody {
  token: string;
  code: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, code } = req.body as VerifyBody;

  if (!token || !code) {
    return res.status(400).json({ error: 'Missing token or code' });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, storedCode] = decoded.split(':');

    if (code !== storedCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      email,
    });
  } catch {
    return res.status(400).json({ error: 'Invalid token' });
  }
}
