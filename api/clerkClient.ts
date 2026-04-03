import { createClerkClient } from '@clerk/clerk-sdk-node';

// Lazy-load Clerk client to avoid initialization errors when CLERK_SECRET_KEY is not set
let _clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }
  if (!_clerkClient) {
    _clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return _clerkClient;
}

// Find user ID by agent token stored in publicMetadata
export async function findUserIdByAgentToken(token: string): Promise<string | null> {
  if (!token) {
    return null;
  }

  const clerk = getClerkClient();
  if (!clerk) {
    return null;
  }

  try {
    const response = await clerk.users.getUserList({
      limit: 100,
    });

    for (const user of response.data) {
      const agentToken = user.publicMetadata?.agentToken as string | undefined;
      if (agentToken === token) {
        return user.id;
      }
    }

    return null;
  } catch (error) {
    console.error('[Clerk] Error finding user by token:', error);
    return null;
  }
}

// Update user's agent token in publicMetadata
export async function updateUserAgentToken(userId: string, token: string): Promise<boolean> {
  const clerk = getClerkClient();
  if (!clerk) {
    console.warn('[Clerk] CLERK_SECRET_KEY not configured, skipping Clerk update');
    return false;
  }

  try {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        agentToken: token,
      },
    });
    return true;
  } catch (error) {
    console.error('[Clerk] Error updating user metadata:', error);
    return false;
  }
}
