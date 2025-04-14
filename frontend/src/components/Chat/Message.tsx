import React, { forwardRef } from 'react';
import { CheckAllIcon, CheckIcon } from '../../icons';
import { IMessage } from '../../types/message';

interface MessageProps {
  message: IMessage;
  isCurrentUser: boolean;
  showTimestamp: boolean;
  formatDate: (date: Date) => string;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isCurrentUser, showTimestamp, formatDate }, ref) => {
    const renderStatus = () => {
      if (!isCurrentUser) return null;

      switch (message.status) {
        case 'sent':
          return (
            <CheckIcon
              className="w-4 h-4 text-gray-400"
              aria-label="Odesláno"
            />
          );
        case 'delivered':
          return (
            <CheckAllIcon
              className="w-4 h-4 text-gray-400"
              aria-label="Doručeno"
            />
          );
        case 'read':
          return (
            <CheckAllIcon
              className="w-4 h-4 text-blue-500"
              aria-label="Přečteno"
            />
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'
          }`}
      >
        <div
          className={`rounded-lg px-4 py-2 ${isCurrentUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
            }`}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {showTimestamp && (
          <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
            <span>{formatDate(message.timestamp)}</span>
            {renderStatus()}
          </div>
        )}
      </div>
    );
  }
);

Message.displayName = 'Message'; 