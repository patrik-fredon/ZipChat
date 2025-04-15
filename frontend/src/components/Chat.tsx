import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import '../styles/Chat.css';
import { Message } from '../types/chat';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    sendTyping,
    onMessage,
    onTyping,
    onConnected,
    onDisconnected,
    onError
  } = useWebSocket();

  useEffect(() => {
    const cleanupMessage = onMessage((data) => {
      setMessages(prev => [...prev, data]);
    });

    const cleanupTyping = onTyping((data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev, data.userId]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    const cleanupConnected = onConnected(() => {
      setConnectionStatus('connected');
      setError(null);
    });

    const cleanupDisconnected = onDisconnected(() => {
      setConnectionStatus('disconnected');
    });

    const cleanupError = onError((error) => {
      setError(error.message);
    });

    return () => {
      cleanupMessage();
      cleanupTyping();
      cleanupConnected();
      cleanupDisconnected();
      cleanupError();
    };
  }, [onMessage, onTyping, onConnected, onDisconnected, onError]);

  useEffect(() => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        // Ignore scroll errors in test environment
        console.warn('Scroll error:', error);
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      setIsTyping(false);
      sendTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    sendTyping(false);
  };

  return (
    <div className="chat-container">
      {error && <div className="error-message">{error}</div>}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' ? 'Připojeno' : 'Odpojeno'}
      </div>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <span className="user">{message.userId}</span>
            <span className="content">{message.content}</span>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'píše' : 'píší'}...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Napište zprávu..."
          disabled={connectionStatus === 'disconnected'}
        />
        <button type="submit" disabled={connectionStatus === 'disconnected'}>
          Odeslat
        </button>
      </form>
    </div>
  );
}; 