import type { ChatMessageType, Citation } from "@/types/chat";
import { extractCitations } from "@/utils/formatter";
import { cn } from "@/utils/cn";

type ChatMessageProps = {
  message: ChatMessageType;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const handleCitationClick = (citations: Citation[]) => {
    const citationList = citations
      .map((c) => c.indices.map((i) => `${c.docNum}-${i}`).join(", "))
      .join(", ");
    alert(`Citations: ${citationList}`);
  };

  const renderContent = () => {
    if (message.role === "user") {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    const lines = message.content.split("\n");

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <h3 key={index} className="font-semibold text-lg mt-4 mb-2">
                {line.replace(/\*\*/g, "")}
              </h3>
            );
          }

          if (line.startsWith("• ")) {
            const bulletContent = line.substring(2);
            const parts = bulletContent.split(/(\[\d+-\d+\])/g);

            return (
              <div key={index} className="flex gap-2">
                <span className="text-gray-500">•</span>
                <div className="flex-1">
                  {parts.map((part, partIndex) => {
                    const citationMatch = part.match(/\[(\d+)-(\d+)\]/);
                    if (citationMatch) {
                      const citations = extractCitations(part);
                      const uniqueDocNums = [
                        ...new Set(citations.map((c) => c.docNum)),
                      ];

                      return (
                        <button
                          key={partIndex}
                          onClick={() => handleCitationClick(citations)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs hover:bg-indigo-100 transition-colors ml-1"
                        >
                          {uniqueDocNums.join(", ")}
                        </button>
                      );
                    }

                    const nextPart = parts[partIndex + 1];
                    const hasFollowingCitation =
                      nextPart && nextPart.match(/\[\d+-\d+\]/);

                    if (hasFollowingCitation && part.trim()) {
                      const nextCitations = extractCitations(nextPart);
                      return (
                        <span
                          key={partIndex}
                          onClick={() => handleCitationClick(nextCitations)}
                          className="cursor-pointer hover:bg-gray-50 rounded px-1"
                        >
                          {part}
                        </span>
                      );
                    }

                    return <span key={partIndex}>{part}</span>;
                  })}
                </div>
              </div>
            );
          }

          if (line.trim()) {
            return <p key={index}>{line}</p>;
          }

          return null;
        })}
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "max-w-[100%] rounded-lg px-2 py-1",
        message.role === "user"
          ? "max-w-[70%] bg-gray-100 text-black-100 ml-auto"
          : ""
      )}
    >
      {renderContent()}
    </div>
  );
}
