import { emitter } from "~/services/emitter.server";
import { eventStream } from "remix-utils/sse/server";

export async function loader({ request }: any) {
  return eventStream(request.signal, (send) => {
    function handle(message: { id: string; content: string; role: string }) {
      send({ event: "new-message", data: JSON.stringify(message) });
    }

    emitter.on("message", handle);

    return function clear() {
      emitter.off("message", handle);
    };
  });
}