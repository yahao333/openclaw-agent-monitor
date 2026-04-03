import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { createClerkClient } from '@clerk/clerk-sdk-node';

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

// Lazy-load Clerk client
let _clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  if (!_clerkClient) {
    _clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return _clerkClient;
}

async function findUserIdByAgentToken(token: string): Promise<string | null> {
  const clerk = getClerkClient();
  if (!clerk) return null;
  try {
    const response = await clerk.users.getUserList({ limit: 100 });
    for (const user of response.data) {
      const agentToken = user.publicMetadata?.agentToken as string | undefined;
      if (agentToken === token) return user.id;
    }
    return null;
  } catch (error) {
    console.error('[Clerk] Error finding user by token:', error);
    return null;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const token = req.headers['x-agent-token'] as string;
  const userId = req.headers['x-user-id'] as string;

  // Case 1: User logged in (has userId) - can read/write their own agents
  if (userId) {
    const agentsKey = `agents:${userId}`;

    if (req.method === 'GET') {
      try {
        const agents = await redis.get<AgentData[]>(agentsKey);
        // 添加 lastActiveTimestamp，用于前端判断离线（超过10分钟未上报视为离线）
        const now = Date.now();
        const agentsWithTimestamp = (agents || []).map(agent => ({
          ...agent,
          lastActiveTimestamp: agent.lastActiveTimestamp || now
        }));
        return res.status(200).json(agentsWithTimestamp);
      } catch (error) {
        console.error('Redis GET error:', error);
        return res.status(500).json({ error: 'Failed to fetch agents' });
      }
    }

    if (req.method === 'POST') {
      try {
        const agents = req.body as AgentData[];

        if (!Array.isArray(agents)) {
          return res.status(400).json({ error: 'Agents must be an array' });
        }

        for (const agent of agents) {
          if (!agent.id) {
            return res.status(400).json({ error: 'Invalid agent data: missing required fields' });
          }
          if (!agent.name || typeof agent.name !== 'object') {
            agent.name = { en: agent.id, zh: agent.id };
          }
          if (!agent.lastActiveTimestamp) {
            agent.lastActiveTimestamp = Date.now();
          }
        }

        await redis.set(agentsKey, agents, { ex: REDIS_TTL });
        return res.status(200).json({ success: true, count: agents.length, ttl: REDIS_TTL });
      } catch (error) {
        console.error('Redis POST error:', error);
        return res.status(500).json({ error: 'Failed to save agents' });
      }
    }
  }

  // Case 2: External agent upload (has token only) - must validate token against user settings
  if (token) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed for agent token' });
    }

    try {
      // First try: Find user by token in Clerk publicMetadata (authoritative source)
      let matchedUserId = await findUserIdByAgentToken(token);

      // Fallback: Scan Redis settings keys for backward compatibility
      if (!matchedUserId) {
        const settingsKeys = await redis.keys('settings:*');
        for (const settingsKey of settingsKeys) {
          const settings = await redis.get<Settings>(settingsKey);
          if (settings && settings.token === token) {
            matchedUserId = settingsKey.replace('settings:', '');
            break;
          }
        }
      }

      if (!matchedUserId) {
        return res.status(403).json({ error: 'Invalid token: token not found in any user settings' });
      }

      // Token is valid, process the upload
      const agents = req.body as AgentData[];

      if (!Array.isArray(agents)) {
        return res.status(400).json({ error: 'Agents must be an array' });
      }

      for (const agent of agents) {
        if (!agent.id) {
          return res.status(400).json({ error: 'Invalid agent data: missing required fields' });
        }
        if (!agent.name || typeof agent.name !== 'object') {
          agent.name = { en: agent.id, zh: agent.id };
        }
        if (!agent.lastActiveTimestamp) {
          agent.lastActiveTimestamp = Date.now();
        }
      }

      const agentsKey = `agents:${matchedUserId}`;
      await redis.set(agentsKey, agents, { ex: REDIS_TTL });

      return res.status(200).json({ success: true, count: agents.length, userId: matchedUserId, ttl: REDIS_TTL });
    } catch (error) {
      console.error('Redis agent upload error:', error);
      return res.status(500).json({ error: 'Failed to upload agents' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized: missing token or userId' });
}
