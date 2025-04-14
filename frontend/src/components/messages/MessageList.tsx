import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { websocketService } from '../../services/websocket';
import { Message as MessageType } from '../../types/message';
import { MessageItem } from './MessageItem';

export const MessageList: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!user) return;

        const response = await api.get(`/messages/user/${user.id}`);
        setMessages(response.data);
      } catch (err) {
        setError('Nepodařilo se načíst zprávy');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    websocketService.connect(user.id);

    // Handle new messages
    const handleNewMessage = (message: MessageType) => {
      setMessages(prevMessages => {
        // Check if message already exists
        if (prevMessages.some(m => m.id === message.id)) {
          return prevMessages;
        }
        return [message, ...prevMessages];
      });
    };

    websocketService.onMessage(handleNewMessage);

    // Cleanup
    return () => {
      websocketService.removeMessageHandler(handleNewMessage);
      websocketService.disconnect();
    };
  }, [user]);

  if (loading) return <div className="loading">Načítání zpráv...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">Žádné zprávy</div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === user?.id}
          />
        ))
      )}
    </div>
  );
}; 