import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  chatId: string;
}

export function ChatWindow({ messages: initialMessages, isLoading, chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { onMessage, onConnected, onDisconnected, onError } = useWebSocket(
    `${process.env.REACT_APP_WS_URL}/chat/${chatId}`
  );

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const unsubscribeMessage = onMessage((message) => {
      if (message.type === 'new_message') {
        setMessages((prev) => [...prev, message.payload]);
      }
    });

    const unsubscribeConnected = onConnected(() => {
      console.log('WebSocket připojeno');
    });

    const unsubscribeDisconnected = onDisconnected(() => {
      console.log('WebSocket odpojeno');
    });

    const unsubscribeError = onError((error) => {
      console.error('WebSocket chyba:', error);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
    };
  }, [onMessage, onConnected, onDisconnected, onError]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 