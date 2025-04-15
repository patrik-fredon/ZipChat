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
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, loadMoreMessages } = useMessages(recipientId);
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  const [recipientStatus, setRecipientStatus] = useState<{
    isOnline: boolean;
    lastSeen: string;
  } | null>(null);

  useEffect(() => {
    if (isConnected) {
      subscribe('typing', (data) => {
        if (data.userId === recipientId) {
          setIsTyping(data.isTyping);
        }
      });

      subscribe('status', (data) => {
        if (data.userId === recipientId) {
          setRecipientStatus({
            isOnline: data.isOnline,
            lastSeen: data.lastSeen,
          });
        }
      });
    }

    return () => {
      unsubscribe('typing');
      unsubscribe('status');
    };
  }, [isConnected, recipientId, subscribe, unsubscribe]);

  const handleSendMessage = async (message: any) => {
    try {
      await sendMessage(message);
      setIsTyping(false);
    } catch (error) {
      console.error('Chyba při odesílání zprávy:', error);
    }
  };

  const handleLoadMore = async () => {
    if (isLoading || !hasMoreMessages) return;

    setIsLoading(true);
    try {
      const newMessages = await loadMoreMessages();
      setHasMoreMessages(newMessages.length > 0);
    } catch (error) {
      console.error('Chyba při načítání zpráv:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          currentUserId={currentUserId}
          recipientId={recipientId}
          isTyping={isTyping}
          onTyping={setIsTyping}
        />
      </div>
    </div>
  );
}; 