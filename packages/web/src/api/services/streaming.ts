const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const streamingApi = {
    async startStreamWithFetch(
        query: string,
        onChunk: (text: string) => void,
        onComplete?: () => void,
        onError?: (error: any) => void
    ) {
        try {
            const response = await fetch(`${API_BASE_URL}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.text) {
                                onChunk(data.text);
                            }
                        } catch (e) {
                            console.error('Failed to parse chunk:', e);
                        }
                    } else if (line.startsWith('event: done')) {
                        onComplete?.();
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            onError?.(error);
        }
    },

    getStreamUrl: (query: string) => {
        const params = new URLSearchParams({ query });
        return `${API_BASE_URL}/answer?${params.toString()}`;
    },
};
