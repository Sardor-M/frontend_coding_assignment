import { useRef, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { ArrowRight } from "lucide-react";
import { isStreamingAtom, messagesAtom } from "@/atoms/project";
import type { ChatMessageType } from "@/types/chat";
import ChatMessage from "@/components/chat/ChatMessage";

const DEMO_RESPONSE = `Heat shock protein (HSP) related therapies present a promising avenue for cancer treatment. However, several potential complications and limitations need to be considered when employing such therapies.

**Potential Complications and Challenges**

• Therapeutic Resistance: One of the most significant issues with heat shock protein therapy, specifically heat shock protein 90 (HSP90), is that its inhibition can lead to therapeutic resistance. Cancer cells often upregulate heat shock proteins as a survival response to stress, including heat, which can lead to resistance to therapies like photothermal therapy (PTT). [2-1]

• Chemoresistance: Small heat shock proteins (sHSPs) are associated with chemoresistance, as they are involved in various functions like tumorigenesis, cell growth, and metastasis. [3-1]

• Pain and Analgesia Issues: HSP90 inhibitors can interfere with opioid-induced analgesia, reducing the effectiveness of pain management in cancer patients. Studies have shown that HSP90 inhibition can block morphine and oxymorphone antinociception, particularly in chemotherapy-induced peripheral neuropathy and cancer-induced bone pain. [7-1]

• Side Effects and Toxicity: The requirement for high dosages of nanomaterials in PTT can lead to side effects, organ burdens due to excretion, and long-term accumulation in the body. [4-1]`;

export default function ChatInterface() {
  const [messages, setMessages] = useRecoilState(messagesAtom);
  const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateStreaming = (assistantMessageId: string) => {
    setIsStreaming(true);
    const words = DEMO_RESPONSE.split(" ");
    let currentIndex = 0;
    let accumulatedContent = "";

    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        accumulatedContent +=
          (currentIndex > 0 ? " " : "") + words[currentIndex];
        currentIndex++;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      } else {
        clearInterval(streamInterval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          )
        );
        setIsStreaming(false);
      }
    }, 50);
  };

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

    simulateStreaming(assistantMessage.id);
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
