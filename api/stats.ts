import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface AgentStats {
  total: number;
  online: number;
  offline: number;
  updatedAt: string;
  source: string;
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Get agent statistics
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = await redis.get<AgentStats>('stats:agents');

    if (!stats) {
      // No stats yet, return empty
      return res.status(200).json({
        total: 0,
        online: 0,
        offline: 0,
        updatedAt: null,
        source: 'initial'
      });
    }

    return res.status(200).json(stats);

  } catch (error) {
    console.error('[stats] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
