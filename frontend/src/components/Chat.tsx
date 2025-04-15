import React, { useState } from 'react';
import { Message } from '../types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (encryptedMessage: {
    content: string;
    iv: string;
    key: string;
  }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: encryptedMessage.content,
      iv: encryptedMessage.iv,
      key: encryptedMessage.key,
      timestamp: new Date(),
      sender: 'currentUser',
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);

    // TODO: Implement API call to send message
    // After successful send, update message status
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }, 1000);
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            isCurrentUser={message.sender === 'currentUser'}
          />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}; 