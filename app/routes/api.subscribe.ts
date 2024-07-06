import { emitter } from "~/services/emitter.server";
import { eventStream } from "remix-utils/sse/server";
import { getAuthFromRequest } from "~/utils/auth";
import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return new Response("User not authenticated", { status: 401 });
  }

  return eventStream(request.signal, (send) => {
    function handle(message: { userId: string; id: string; content: string; role: string }) {
      console.log("message.userId "+message.userId)
      console.log("userId "+userId)

      if (message.userId.toString() === userId?.toString()) {
        send({ event: "new-message", data: JSON.stringify(message) });
      }
      
console.log(message)
    }
    emitter.on("message", handle);

    return () => {
      emitter.off("message", handle);
    };
  });
};
