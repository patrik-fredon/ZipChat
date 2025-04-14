import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import { api } from '../../services/api';
import { EmojiPicker } from '../common/EmojiPicker';
import { FilePreview } from '../common/FilePreview';

interface MessageComposerProps {
  recipientId: string;
  onMessageSent: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ recipientId, onMessageSent }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [expiration, setExpiration] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useLocalStorage(`message_draft_${recipientId}`, '');
  const { isTyping, handleTyping } = useTypingIndicator(recipientId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Save draft
  useEffect(() => {
    if (content) {
      setDraft(content);
    }
  }, [content, setDraft]);

  // Load draft
  useEffect(() => {
    if (draft) {
      setContent(draft);
    }
  }, [draft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !content.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('senderId', user.id);
      formData.append('recipientId', recipientId);
      formData.append('content', content.trim());
      if (expiration) {
        formData.append('expiresAt', expiration);
      }
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setContent('');
      setExpiration('');
      setAttachments([]);
      setDraft('');
      onMessageSent();
    } catch (err) {
      setError('Nepodařilo se odeslat zprávu');
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-composer">
      <div className="form-group">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Napište zprávu..."
          disabled={isSending}
          required
          className="auto-resize"
          aria-label="Text zprávy"
        />
      </div>

      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => removeAttachment(index)}
            />
          ))}
        </div>
      )}

      <div className="composer-actions">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="emoji-button"
          aria-label="Vložit emoji"
        >
          😊
        </button>

        <input
          type="file"
          id="file-upload"
          onChange={handleFileSelect}
          multiple
          className="file-input"
          aria-label="Přidat přílohu"
        />
        <label htmlFor="file-upload" className="file-label">
          📎
        </label>

        <div className="form-group expiration">
          <label htmlFor="expiration">Platnost zprávy (volitelné):</label>
          <input
            type="datetime-local"
            id="expiration"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            aria-label="Platnost zprávy"
          />
        </div>

        <button
          type="submit"
          disabled={isSending || !content.trim()}
          className="send-button"
          aria-label="Odeslat zprávu"
        >
          {isSending ? 'Odesílám...' : 'Odeslat zprávu'}
        </button>
      </div>

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={(emoji) => {
            setContent(content + emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {error && <div className="error" role="alert">{error}</div>}
      {isTyping && <div className="typing-indicator">Píše...</div>}
    </form>
  );
}; 