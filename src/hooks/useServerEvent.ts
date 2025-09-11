import { useCallback, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { isStreamingAtom } from "@/atoms/project";

type UseSSEOptions = {
  onMessage: (data: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
};

export default function useSSE() {
  const setIsStreaming = useSetRecoilState(isStreamingAtom);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(
    (url: string, options: UseSSEOptions) => {
      /* here we close existing connection before creating new one */
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setIsStreaming(true);
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onmessage = (event) => {
        options.onMessage(event.data);
      };

      eventSourceRef.current.onerror = (error) => {
        console.info("SSE error:", error);
        setIsStreaming(false);
        eventSourceRef.current?.close();

        if (options.onError) {
          options.onError(new Error("SSE connection failed"));
        }

        if (options.onComplete) {
          options.onComplete();
        }
      };

      eventSourceRef.current.addEventListener("done", () => {
        setIsStreaming(false);
        eventSourceRef.current?.close();

        if (options.onComplete) {
          options.onComplete();
        }
      });
    },
    [setIsStreaming]
  );

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  }, [setIsStreaming]);

  return { connect, disconnect };
}
