import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React from 'react';
import { IMessage } from '../types/message';

interface MessageItemProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓✓';
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${isOwnMessage
          ? 'bg-blue-500 text-white rounded-br-none'
          : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
      >
        <div className="text-sm">{message.content}</div>
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className="text-xs opacity-75">
            {format(new Date(message.timestamp), 'HH:mm', { locale: cs })}
          </span>
          {isOwnMessage && (
            <span className="text-xs opacity-75">{getStatusIcon()}</span>
          )}
        </div>
      </div>
    </div>
  );
}; 