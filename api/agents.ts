import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface AgentData {
  id: string;
  name: { en: string; zh: string };
  status: 'online' | 'offline';
  lastActive: { en: string; zh: string };
  greeting: { en: string; zh: string };
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow token-based access for external agents
  const token = req.headers['x-agent-token'] as string;
  const userId = req.headers['x-user-id'] as string;

  // Must have either token or userId
  const key = token || userId;
  if (!key) {
    return res.status(401).json({ error: 'Unauthorized: missing token or userId' });
  }

  const agentsKey = `agents:${key}`;

  if (req.method === 'GET') {
    try {
      const agents = await redis.get<AgentData[]>(agentsKey);
      if (!agents) {
        return res.status(200).json([]);
      }
      return res.status(200).json(agents);
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

      // Validate each agent has required fields
      for (const agent of agents) {
        if (!agent.id || !agent.name || !agent.status) {
          return res.status(400).json({ error: 'Invalid agent data: missing required fields' });
        }
      }

      await redis.set(agentsKey, JSON.stringify(agents));
      return res.status(200).json({ success: true, count: agents.length });
    } catch (error) {
      console.error('Redis POST error:', error);
      return res.status(500).json({ error: 'Failed to save agents' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
