import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React, { useEffect, useRef } from 'react';
import { IMessage } from '../types/message';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: IMessage[];
  currentUserId: string;
  onMessageRead: (messageId: string) => void;
  onLoadMore: () => void;
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onMessageRead,
  onLoadMore,
  isLoading
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Seskupení zpráv podle data a odesílatele
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd', { locale: cs });
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === date && lastGroup.senderId === message.senderId) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        date,
        senderId: message.senderId,
        messages: [message]
      });
    }

    return groups;
  }, [] as { date: string; senderId: string; messages: IMessage[] }[]);

  // Automatické scrollování na nové zprávy
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Detekce přečtení zprávy při scrollování
  const handleScroll = () => {
    if (!listRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = listRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom) {
      messages
        .filter(msg => !msg.isRead && msg.recipientId === currentUserId)
        .forEach(msg => onMessageRead(msg.id));
    }

    if (scrollTop === 0 && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {groupedMessages.map((group, index) => (
        <div key={index} className="space-y-2">
          <div className="text-center text-sm text-gray-500 mb-2">
            {format(new Date(group.date), 'd. MMMM yyyy', { locale: cs })}
          </div>
          {group.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))}
        </div>
      ))}
      {isLoading && (
        <div className="text-center text-gray-500 py-4">
          Načítání starších zpráv...
        </div>
      )}
    </div>
  );
}; 