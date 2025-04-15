import React from 'react';
import { useEncryption } from '../hooks/useEncryption';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const { decrypt } = useEncryption();

  const [decryptedContent, setDecryptedContent] = React.useState<string>('');

  React.useEffect(() => {
    const decryptMessage = async () => {
      try {
        const decrypted = await decrypt(message.content, message.iv, message.key);
        setDecryptedContent(decrypted);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        setDecryptedContent('Failed to decrypt message');
      }
    };

    decryptMessage();
  }, [message, decrypt]);

  return (
    <div className={`message ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="message-content">
        <p>{decryptedContent}</p>
        <span className="timestamp">
          {message.timestamp.toLocaleTimeString()}
        </span>
        <span className={`status ${message.status}`}>
          {message.status === 'sending' && 'Sending...'}
          {message.status === 'sent' && 'Sent'}
          {message.status === 'error' && 'Error'}
        </span>
      </div>
    </div>
  );
}; 