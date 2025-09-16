import type { ChatMessageType, Citation } from '@/types/chat';
import { extractCitations } from '@/utils/formatter';
import { cn } from '@/utils/cn';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useEffect, useState } from 'react'; // Added ReactNode for better typing

type ChatMessageProps = {
    message: ChatMessageType;
    onCitationClick?: (citations: Citation[]) => void;
};

export default function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
    const [isStreaming, setIsStreaming] = useState(message.isStreaming);

    /* we update the streaming state if the message prop changes */
    useEffect(() => {
        setIsStreaming(message.isStreaming);
    }, [message.isStreaming]);

    const handleCitationClick = (citations: Citation[]) => {
        if (onCitationClick) {
            onCitationClick(citations);
        } else {
            const citationList = citations
                .map((c) => c.indices.map((i) => `${c.docNum}-${i}`).join(', '))
                .join(', ');
            alert(`Citations: ${citationList}`);
        }
    };

    const citationRenderer = (props: React.ComponentPropsWithoutRef<'text'>) => {
        const children = props.children;
        const text = String(children);
        const parts = text.split(/(\[\d+-\d+\])/g);

        return (
            <>
                {parts.map((part, i) => {
                    const match = part.match(/\[(\d+)-(\d+)\]/);
                    if (match) {
                        const citations = extractCitations(part);
                        const uniqueDocNums = [...new Set(citations.map((c) => c.docNum))];
                        return (
                            <sup
                                key={i}
                                className="text-xs text-indigo-600 hover:underline cursor-pointer ml-0.5"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCitationClick(citations);
                                    }}
                                    className="bg-transparent border-none p-0 text-inherit no-underline"
                                    aria-label={`Citation ${uniqueDocNums.join(',')}`}
                                >
                                    {uniqueDocNums.join(',')}
                                </button>
                            </sup>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </>
        );
    };

    const renderContent = () => {
        if (message.role === 'user') {
            return <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>;
        }

        return (
            <div className="prose prose-sm max-w-none text-black">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: (props) => (
                            <h1
                                className="text-lg font-bold text-black mt-0 mb-2 border-b border-gray-200 pb-1"
                                {...props}
                            />
                        ),
                        h2: (props) => (
                            <h2
                                className="text-base font-semibold text-black mt-4 mb-2"
                                {...props}
                            />
                        ),
                        h3: (props) => (
                            <h3 className="text-sm font-medium text-black mt-3 mb-1" {...props} />
                        ),
                        strong: (props) => (
                            <strong className="font-semibold text-black" {...props} />
                        ),
                        text: citationRenderer,
                        ul: (props) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,

                        ol: (props) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
                        ),

                        li: ({ children, ...props }) => {
                            const processContent = (content: React.ReactNode): React.ReactNode => {
                                if (typeof content === 'string') {
                                    const parts = content.split(/(\[\d+-\d+\])/g);
                                    return parts.map((part, i) => {
                                        const match = part.match(/\[(\d+)-(\d+)\]/);
                                        if (match) {
                                            const docNum = match[1];
                                            return (
                                                <sup
                                                    key={i}
                                                    className="text-xs text-blue-600 ml-0.5"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleCitationClick([
                                                                {
                                                                    docNum: parseInt(docNum),
                                                                    indices: [parseInt(match[2])],
                                                                },
                                                            ])
                                                        }
                                                        className="hover:underline"
                                                    >
                                                        {docNum}
                                                    </button>
                                                </sup>
                                            );
                                        }
                                        return <span key={i}>{part}</span>;
                                    });
                                }
                                return content;
                            };

                            return (
                                <li className="text-sm leading-relaxed text-black" {...props}>
                                    {React.Children.map(children, (child) => {
                                        if (typeof child === 'string') {
                                            return processContent(child);
                                        }
                                        return child;
                                    })}
                                </li>
                            );
                        },
                        p: ({ children, ...props }) => {
                            const processContent = (content: React.ReactNode): React.ReactNode => {
                                if (typeof content === 'string') {
                                    const parts = content.split(/(\[\d+-\d+\])/g);
                                    return parts.map((part, i) => {
                                        const match = part.match(/\[(\d+)-(\d+)\]/);
                                        if (match) {
                                            const docNum = match[1];
                                            return (
                                                <sup
                                                    key={i}
                                                    className="text-xs text-blue-600 ml-0.5"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleCitationClick([
                                                                {
                                                                    docNum: parseInt(docNum),
                                                                    indices: [parseInt(match[2])],
                                                                },
                                                            ])
                                                        }
                                                        className="hover:underline"
                                                    >
                                                        {docNum}
                                                    </button>
                                                </sup>
                                            );
                                        }
                                        return <span key={i}>{part}</span>;
                                    });
                                }
                                return content;
                            };

                            return (
                                <p className="text-sm leading-relaxed text-black mb-2" {...props}>
                                    {React.Children.map(children, (child) => {
                                        if (typeof child === 'string') {
                                            return processContent(child);
                                        }
                                        return child;
                                    })}
                                </p>
                            );
                        },
                    }}
                >
                    {message.content}
                </ReactMarkdown>
                {isStreaming && (
                    <div className="flex items-center mt-2">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                            ▍
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn('flex mb-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[100%] px-4 py-3 text-sm leading-relaxed',
                    message.role === 'user'
                        ? 'bg-gray-200 text-black ml-auto max-w-[70%] rounded-2xl shadow-sm'
                        : 'bg-white text-black'
                )}
            >
                {renderContent()}
            </div>
        </div>
    );
}
