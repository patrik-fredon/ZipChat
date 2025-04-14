import React from 'react';
import { IMessage } from '../../types/message';
import { Message } from './Message';

interface MessageListProps {
  messages: IMessage[];
  currentUserId: string;
  lastMessageRef: React.RefObject<HTMLDivElement>;
  formatDate: (date: Date) => string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  lastMessageRef,
  formatDate
}) => {
  const renderMessageGroup = (messages: IMessage[], isCurrentUser: boolean) => {
    return messages.map((message, index) => {
      const isLastInGroup = index === messages.length - 1;
      const showTimestamp = isLastInGroup ||
        messages[index + 1]?.timestamp.getTime() - message.timestamp.getTime() > 5 * 60 * 1000;

      return (
        <Message
          key={message.id}
          message={message}
          isCurrentUser={isCurrentUser}
          showTimestamp={showTimestamp}
          ref={index === messages.length - 1 ? lastMessageRef : undefined}
          formatDate={formatDate}
        />
      );
    });
  };

  const groupMessagesByUser = (messages: IMessage[]) => {
    const groups: IMessage[][] = [];
    let currentGroup: IMessage[] = [];

    messages.forEach((message, index) => {
      const isCurrentUser = message.senderId === currentUserId;
      const previousMessage = messages[index - 1];

      if (
        previousMessage &&
        previousMessage.senderId === message.senderId &&
        message.timestamp.getTime() - previousMessage.timestamp.getTime() < 5 * 60 * 1000
      ) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [message];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const messageGroups = groupMessagesByUser(messages);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Zatím zde nejsou žádné zprávy
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messageGroups.map((group, index) => {
        const isCurrentUser = group[0].senderId === currentUserId;
        return (
          <div
            key={`group-${index}`}
            className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'
              }`}
          >
            {renderMessageGroup(group, isCurrentUser)}
          </div>
        );
      })}
    </div>
  );
}; 