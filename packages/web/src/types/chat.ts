export type ChatMessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

export type StreamingRequest = {
  query: string;
  projectId?: string;
};

export type Citation = {
  docNum: number;
  indices: number[];
};
