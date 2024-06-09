import { json } from "@remix-run/node";
import OpenAI from "openai";
import { getAuthFromRequest } from "~/utils/auth";
import { prisma } from "~/utils/prisma.server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const loader = async ({ request }) => {
  try {
    const userId = await getAuthFromRequest(request);

    if (!userId) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        threadId: true,
      },
    });

    if (!user || !user.threadId) {
      return json({ error: 'No thread ID found for user' }, { status: 404 });
    }

    const threadMessages = await openai.beta.threads.messages.list(user.threadId);

    // Invertir el orden de los mensajes
    const reversedMessages = threadMessages.data.reverse();

    return json({ messages: reversedMessages });

  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return json({ error: 'Failed to fetch thread messages' }, { status: 500 });
  }
};
