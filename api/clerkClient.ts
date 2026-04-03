import { createClerkClient } from '@clerk/clerk-sdk-node';

// Server-side Clerk client for backend API calls
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Find user ID by agent token stored in publicMetadata
export async function findUserIdByAgentToken(token: string): Promise<string | null> {
  if (!token || !process.env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const users = await clerkClient.users.getUserList({
      limit: 100,
    });

    for (const user of users) {
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
  if (!process.env.CLERK_SECRET_KEY) {
    console.warn('[Clerk] CLERK_SECRET_KEY not configured, skipping Clerk update');
    return false;
  }

  try {
    await clerkClient.users.updateUserMetadata(userId, {
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
