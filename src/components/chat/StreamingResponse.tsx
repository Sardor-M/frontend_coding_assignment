import { useEffect, useRef } from "react";

type StreamingResponseProps = {
  content: string;
  isComplete: boolean;
};

export default function StreamingResponse({
  content,
  isComplete,
}: StreamingResponseProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [content]);

  return (
    <div className="whitespace-pre-wrap">
      {content}
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
      )}
      <div ref={endRef} />
    </div>
  );
}
