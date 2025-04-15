import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React from 'react';
import { CheckAllIcon, CheckIcon } from '../icons';
import { IMessage } from '../types/message';

interface MessageItemProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <CheckIcon className="w-4 h-4" />;
      case 'delivered':
        return <CheckAllIcon className="w-4 h-4" />;
      case 'read':
        return <CheckAllIcon className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`message ${isOwnMessage ? 'message-own' : 'message-other'} fade-in`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className="text-xs opacity-75">
            {format(new Date(message.timestamp), 'HH:mm', { locale: cs })}
          </span>
          {isOwnMessage && (
            <span className="text-xs opacity-75">{getStatusIcon()}</span>
          )}
        </div>
        {message.expiresAt && (
          <div className="text-xs opacity-75 mt-1">
            Platnost do: {format(new Date(message.expiresAt), 'd. M. yyyy HH:mm', { locale: cs })}
          </div>
        )}
      </div>
    </div>
  );
}; 