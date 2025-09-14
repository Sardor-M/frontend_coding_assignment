import { useRef, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { ArrowRight } from "lucide-react";
import { isStreamingAtom, messagesAtom } from "@/atoms/project";
import type { ChatMessageType } from "@/types/chat";
import ChatMessage from "@/components/chat/ChatMessage";
import useServerEvent from "@/hooks/useServerEvent";
import { streamingApi } from "@/api";

export default function ChatInterface() {
  const [messages, setMessages] = useRecoilState(messagesAtom);
  const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connect } = useServerEvent();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessage: ChatMessageType = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    setInputValue("");

    const streamUrl = streamingApi.getStreamUrl(inputValue);
    let accumulatedContent = "";

    connect(streamUrl, {
      onMessage: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.message?.content || parsed || "";
          accumulatedContent += text;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        } catch {
          accumulatedContent += data;
        }
      },
      onComplete: () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);
      },
      onError: (error: any) => {
        console.error("Streaming error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content:
                    "Error: Failed to get response. Make sure the backend server is running on port 3001.",
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsStreaming(false);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Anything"
              disabled={isStreaming}
              className="w-full px-6 py-4 pr-14 rounded-2xl shadow-sm border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-transparent disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10
                       bg-indigo-500 text-white rounded-full
                       hover:bg-indigo-600 disabled:bg-gray-300
                       flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="w-full max-w-2xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="relative w-full max-w-2xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Anything"
                disabled={isStreaming}
                className="w-full px-6 py-4 pr-14 rounded-2xl shadow-sm border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isStreaming}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10
                         bg-indigo-500 text-white rounded-full
                         hover:bg-indigo-600 disabled:bg-gray-300
                         flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
