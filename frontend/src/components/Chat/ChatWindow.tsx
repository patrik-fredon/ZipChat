import React, { useEffect, useRef, useState } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatDate } from '../../utils/dateUtils';
import { MessageComposer } from './MessageComposer';
import { MessageList } from './MessageList';
import { UserStatus } from './UserStatus';

interface ChatWindowProps {
  recipientId: string;
  currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ recipientId, currentUserId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    hasMoreMessages
  } = useMessages(currentUserId, recipientId);

  const {
    isConnected,
    recipientStatus
  } = useWebSocket({
    currentUserId,
    recipientId,
    onNewMessage: (message) => {
      if (message.senderId === recipientId) {
        markAsRead([message.id]);
      }
    }
  });

  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        await loadMoreMessages();
        setIsLoading(false);
      } catch (err) {
        setError('Nepodařilo se načíst zprávy. Zkuste to prosím později.');
        setIsLoading(false);
      }
    };

    loadInitialMessages();
  }, [recipientId]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      setError('Nepodařilo se odeslat zprávu. Zkuste to prosím později.');
    }
  };

  const handleLoadMore = async () => {
    if (!hasMoreMessages || isLoading) return;

    setIsLoading(true);
    try {
      await loadMoreMessages();
    } catch (err) {
      setError('Nepodařilo se načíst další zprávy. Zkuste to prosím později.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <UserStatus
          isOnline={recipientStatus?.isOnline}
          lastSeen={recipientStatus?.lastSeen}
          isConnected={isConnected}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {hasMoreMessages && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Načítání...' : 'Načíst starší zprávy'}
          </button>
        )}

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          lastMessageRef={lastMessageRef}
          formatDate={formatDate}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <MessageComposer
          onSendMessage={handleSendMessage}
          disabled={!isConnected}
          placeholder={isConnected ? 'Napište zprávu...' : 'Připojování...'}
        />
      </div>
    </div>
  );
}; 