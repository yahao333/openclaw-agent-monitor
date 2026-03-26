import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Settings {
  viewMode: 'aquarium' | 'grid' | 'list';
  lang: 'en' | 'zh';
  showBubbles: boolean;
}

// In-memory store for demo (use Redis/DB in production)
const settingsStore = new Map<string, Settings>();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const settings = settingsStore.get(userId) || {
      viewMode: 'aquarium',
      lang: 'en',
      showBubbles: true,
    };
    return res.status(200).json(settings);
  }

  if (req.method === 'POST') {
    const settings = req.body as Settings;

    if (!settings || typeof settings.viewMode !== 'string' || typeof settings.showBubbles !== 'boolean') {
      return res.status(400).json({ error: 'Invalid settings' });
    }

    settingsStore.set(userId, settings);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
