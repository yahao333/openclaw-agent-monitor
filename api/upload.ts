import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface AgentData {
  id: string;
  name?: { en: string; zh: string };
  status?: 'online' | 'offline';
  lastActive?: { en: string; zh: string };
  lastActiveTimestamp?: number;
  greeting?: { en: string; zh: string };
}

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

// TTL in seconds, default 24 hours
const REDIS_TTL = parseInt(process.env.REDIS_TTL_SECONDS || '86400', 10);

/**
 * External upload endpoint for agents to upload JSON data.
 * Validates token against user settings before allowing upload.
 *
 * POST /api/upload
 * Headers:
 *   - x-agent-token: the token registered in user's settings (required)
 *   - Content-Type: application/json
 * Body: JSON array of AgentData
 *
 * Response:
 *   - 200: { success: true, count: number }
 *   - 400: { error: '...' }
 *   - 401: { error: 'Unauthorized: missing token' }
 *   - 403: { error: 'Invalid token: token not registered in any user settings' }
 *   - 500: { error: 'Failed to upload agents' }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const token = req.headers['x-agent-token'] as string;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: missing x-agent-token header' });
  }

  try {
    // Find the userId that has this token registered in settings
    const settingsKeys = await redis.keys('settings:*');

    let matchedUserId: string | null = null;
    for (const settingsKey of settingsKeys) {
      const settings = await redis.get<Settings>(settingsKey);
      if (settings && settings.token === token) {
        matchedUserId = settingsKey.replace('settings:', '');
        break;
      }
    }

    if (!matchedUserId) {
      return res.status(403).json({
        error: 'Invalid token: token not registered in any user settings',
        hint: 'Please ensure the token is saved in your settings page first'
      });
    }

    // Validate and parse agent data (Vercel auto-parses JSON body)
    const agents = req.body as AgentData[];

    if (!Array.isArray(agents)) {
      return res.status(400).json({ error: 'Invalid format: body must be a JSON array of agents' });
    }

    if (agents.length === 0) {
      return res.status(400).json({ error: 'Invalid data: array cannot be empty' });
    }

    // Validate each agent has required fields, and normalize name from id if missing
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      if (!agent.id || typeof agent.id !== 'string') {
        return res.status(400).json({ error: `Invalid agent at index ${i}: missing or invalid id` });
      }
      // Normalize: if name is missing, use id as name
      if (!agent.name || typeof agent.name !== 'object') {
        agent.name = { en: agent.id, zh: agent.id };
      }
    }

    // Save agents to the matched user's storage with TTL
    const agentsKey = `agents:${matchedUserId}`;
    await redis.set(agentsKey, agents, { ex: REDIS_TTL });

    // Set update timestamp for SSE polling
    const updateKey = `update:${matchedUserId}`;
    await redis.set(updateKey, {
      action: 'agents_updated',
      userId: matchedUserId,
      count: agents.length,
      timestamp: Date.now()
    }, { ex: REDIS_TTL });

    return res.status(200).json({
      success: true,
      count: agents.length,
      message: `Successfully uploaded ${agents.length} agents`,
      ttl: REDIS_TTL
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload agents', details: String(error) });
  }
}
