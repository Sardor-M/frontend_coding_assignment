import type { StreamingRequest } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const streamingApi = {
  getStreamUrl: (query: string) => {
    const params = new URLSearchParams({ query });
    return `${API_BASE_URL}/answer?${params.toString()}`;
  },

  startStream: async (request: StreamingRequest) => {
    const response = await fetch(`${API_BASE_URL}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to start stream");
    }

    return response.body;
  },
};
