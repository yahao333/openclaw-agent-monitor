import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface AgentData {
  id: string;
  name: { en: string; zh: string };
  status: 'online' | 'offline';
  lastActive: { en: string; zh: string };
  greeting: { en: string; zh: string };
}

interface AgentStats {
  total: number;
  online: number;
  offline: number;
  updatedAt: string;
  source: string;
  nextRunAt?: string;
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// TTL in seconds, default 24 hours (same as agents TTL)
const REDIS_TTL = parseInt(process.env.REDIS_TTL_SECONDS || '86400', 10);

// Get interval in hours from environment variable, default 24 (once per day)
// For Vercel Hobby, cron runs once per day at most
const CRON_INTERVAL_HOURS = parseInt(process.env.CRON_INTERVAL || '24', 10);

// Check if enough time has passed since last run
async function shouldRun(): Promise<boolean> {
  try {
    const lastStats = await redis.get<AgentStats>('stats:agents');
    if (!lastStats || !lastStats.updatedAt) {
      return true; // No previous run, should run now
    }

    const lastRun = new Date(lastStats.updatedAt);
    const now = new Date();
    const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastRun >= CRON_INTERVAL_HOURS;
  } catch {
    return true; // Error reading stats, should run now
  }
}

// Cron job to count all agents in Redis and store the total
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET for cron job trigger
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if we should run based on interval
    const shouldProcess = await shouldRun();
    if (!shouldProcess) {
      const nextRun = new Date(Date.now() + CRON_INTERVAL_HOURS * 60 * 60 * 1000).toISOString();
      console.log(`[cron] Skipping - not enough time passed. Next run at: ${nextRun}`);
      return res.status(200).json({
        success: true,
        skipped: true,
        message: `Interval not reached. Next run at ${nextRun}`,
        intervalHours: CRON_INTERVAL_HOURS
      });
    }

    console.log('[cron] Starting agent count job...');

    // Find all agents:* keys
    const agentKeys = await redis.keys('agents:*');
    console.log(`[cron] Found ${agentKeys.length} agent storage keys`);

    let totalAgents = 0;
    let onlineCount = 0;
    let offlineCount = 0;

    // Count agents in each user's storage
    for (const key of agentKeys) {
      const agents = await redis.get<AgentData[]>(key);
      if (Array.isArray(agents)) {
        totalAgents += agents.length;
        onlineCount += agents.filter(a => a.status === 'online').length;
        offlineCount += agents.filter(a => a.status === 'offline').length;
      }
    }

    // Calculate next run time
    const nextRunAt = new Date(Date.now() + CRON_INTERVAL_HOURS * 60 * 60 * 1000).toISOString();

    // Store the stats
    const stats: AgentStats = {
      total: totalAgents,
      online: onlineCount,
      offline: offlineCount,
      updatedAt: new Date().toISOString(),
      source: 'cron',
      nextRunAt
    };

    // Save to Redis with TTL (stats expire faster if CRON_INTERVAL is shorter)
    const statsTTL = Math.max(CRON_INTERVAL_HOURS * 3600, REDIS_TTL);
    await redis.set('stats:agents', stats, { ex: statsTTL });

    console.log(`[cron] Stats saved: total=${totalAgents}, online=${onlineCount}, offline=${offlineCount}`);

    return res.status(200).json({
      success: true,
      stats,
      intervalHours: CRON_INTERVAL_HOURS
    });

  } catch (error) {
    console.error('[cron] Error:', error);
    return res.status(500).json({ error: 'Cron job failed', details: String(error) });
  }
}
