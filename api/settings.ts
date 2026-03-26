import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface Settings {
  viewMode: 'aquarium' | 'grid' | 'list';
  lang: 'en' | 'zh';
  showBubbles: boolean;
  token?: string;
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEFAULT_SETTINGS: Settings = {
  viewMode: 'aquarium',
  lang: 'en',
  showBubbles: true,
  token: '',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const settingsKey = `settings:${userId}`;

  if (req.method === 'GET') {
    try {
      const settings = await redis.get<Settings>(settingsKey);
      if (!settings) {
        return res.status(200).json(DEFAULT_SETTINGS);
      }
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Redis GET error:', error);
      return res.status(500).json({ error: 'Failed to load settings', details: String(error) });
    }
  }

  if (req.method === 'POST') {
    try {
      const settings = req.body as Settings;

      if (!settings || typeof settings.viewMode !== 'string' || typeof settings.showBubbles !== 'boolean') {
        return res.status(400).json({ error: 'Invalid settings' });
      }

      // Upstash Redis auto-parses JSON, so store object directly (not JSON.stringify)
      await redis.set(settingsKey, settings);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Redis POST error:', error);
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
