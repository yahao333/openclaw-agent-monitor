import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface UpdateEvent {
  action: string;
  userId: string;
  timestamp: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const channel = `agent-updates:${userId}`;

  // Get initial timestamp
  let lastTimestamp = 0;
  try {
    const updateKey = `update:${userId}`;
    const updateData = await redis.get<UpdateEvent>(updateKey);
    if (updateData) {
      lastTimestamp = updateData.timestamp || 0;
    }
  } catch (e) {
    console.error('[SSE] Failed to get initial timestamp:', e);
  }

  // Heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  // Poll for changes every 5 seconds
  const pollInterval = setInterval(async () => {
    try {
      const updateKey = `update:${userId}`;
      const updateData = await redis.get<UpdateEvent>(updateKey);

      if (updateData && updateData.timestamp > lastTimestamp) {
        lastTimestamp = updateData.timestamp;
        res.write(`data: ${JSON.stringify(updateData)}\n\n`);
      }
    } catch (e) {
      console.error('[SSE] Poll error:', e);
    }
  }, 5000);

  // Auto-disconnect after 30 seconds
  setTimeout(() => {
    clearInterval(heartbeat);
    clearInterval(pollInterval);
    res.end();
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(pollInterval);
  });

}
