import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Message as MessageType } from '../../types/message';

interface MessageItemProps {
  message: MessageType;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const { user } = useAuth();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    if (!user || decryptedContent) return;

    setIsDecrypting(true);
    setError(null);

    try {
      const response = await api.post('/messages/decrypt', {
        messageId: message.id,
        userId: user.id
      });
      setDecryptedContent(response.data.content);

      // Označit zprávu jako přečtenou
      if (!message.isRead && !isOwnMessage) {
        await api.post(`/messages/${message.id}/read`, {
          userId: user.id
        });
      }
    } catch (err) {
      setError('Nepodařilo se dešifrovat zprávu');
      console.error('Error decrypting message:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own-message' : ''}`}>
      <div className="message-header">
        <span className="sender">
          {isOwnMessage ? 'Vy' : 'Odesílatel'}
        </span>
        <span className="timestamp">
          {format(new Date(message.createdAt), 'd. M. yyyy HH:mm', { locale: cs })}
        </span>
      </div>

      <div className="message-content">
        {decryptedContent ? (
          <p>{decryptedContent}</p>
        ) : (
          <button
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="decrypt-button"
          >
            {isDecrypting ? 'Dešifruji...' : 'Dešifrovat zprávu'}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {message.expiresAt && (
        <div className="expiration">
          Platnost do: {format(new Date(message.expiresAt), 'd. M. yyyy HH:mm', { locale: cs })}
        </div>
      )}
    </div>
  );
}; 