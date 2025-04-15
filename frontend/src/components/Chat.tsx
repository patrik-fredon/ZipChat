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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' ? 'Připojeno' : 'Odpojeno'}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <div className="message-content">{message.content}</div>
            <div className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1
            ? 'Někdo píše...'
            : `${typingUsers.length} lidé píší...`}
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Napište zprávu..."
          disabled={connectionStatus === 'disconnected'}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || connectionStatus === 'disconnected'}
        >
          Odeslat
        </button>
      </div>
    </div>
  );
}; 