import { json, ActionFunction } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import { getAuthFromRequest } from "~/utils/auth";

export const action: ActionFunction = async ({ request }) => {
  try {
    const userId = await getAuthFromRequest(request);
    if (!userId) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { threadId: true },
    });

    if (!user || !user.threadId) {
      return json({ error: 'Thread not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { threadId: null },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return json({ error: 'Failed to delete thread' }, { status: 500 });
  }
};
