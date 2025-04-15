import React from 'react';
import { useEncryption } from '../hooks/useEncryption';

interface ChatInputProps {
  onSendMessage: (content: string, iv: string, key: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = React.useState('');
  const { encrypt } = useEncryption();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const { content, iv, key } = await encrypt(message);
      onSendMessage(content, iv, key);
      setMessage('');
    } catch (error) {
      console.error('Failed to encrypt message:', error);
      // TODO: Show error to user
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit" disabled={!message.trim()}>
        Send
      </button>
    </form>
  );
}; 