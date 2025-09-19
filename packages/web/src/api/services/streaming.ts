const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-bff.onrender.com';

export const streamingApi = {
    async startStreamWithFetch(
        query: string,
        onChunk: (text: string) => void,
        onComplete?: () => void,
        onError?: (error: any) => void
    ) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/answer?query=${encodeURIComponent(query)}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'text/event-stream',
                    },
                    credentials: 'omit',
                    mode: 'cors',
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response not OK:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]' || data === '') {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.text && parsed.text !== 'Stream complete') {
                                onChunk(parsed.text);
                            }
                        } catch (e) {
                            if (data && data !== 'Stream complete') {
                                onChunk(data);
                            }
                        }
                    } else if (line.startsWith('event: done')) {
                        onComplete?.();
                        return;
                    }
                }
            }

            onComplete?.();
        } catch (error) {
            console.error('Streaming fetch error:', error);
            onError?.(error);
        }
    },
};
