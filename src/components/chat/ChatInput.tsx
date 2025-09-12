import { useState } from "react";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
};

export default function ChatInput({
  onSendMessage,
  isStreaming,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Anything"
        disabled={isStreaming}
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={!input.trim() || isStreaming}
        isLoading={isStreaming}
      >
        {!isStreaming && <Send className="w-5 h-5" />}
      </Button>
    </form>
  );
}
