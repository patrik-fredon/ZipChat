import React, { useEffect, useState } from 'react';
import { WebSocketService } from '../services/websocket';
import { Message } from '../types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsService = WebSocketService.getInstance();

    wsService.connect({
      url: 'ws://localhost:3000/chat',
      onMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onError: (error) => {
        console.error('WebSocket chyba:', error);
        setError('Chyba připojení k chatu');
      },
      onClose: () => {
        setIsConnected(false);
      }
    });

    return () => {
      wsService.disconnect();
    };
  }, []);

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

    try {
      const wsService = WebSocketService.getInstance();
      wsService.sendMessage(newMessage);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    } catch (error) {
      console.error('Chyba při odesílání zprávy:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'error' }
            : msg
        )
      );
    }
  };

  return (
    <div className="chat">
      {error && <div className="error-message">{error}</div>}
      <div className="connection-status">
        Stav: {isConnected ? 'Připojeno' : 'Odpojeno'}
      </div>
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