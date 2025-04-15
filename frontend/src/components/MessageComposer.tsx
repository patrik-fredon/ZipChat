import React, { useEffect, useRef, useState } from 'react';
import { IMessage } from '../types/message';
import { EmojiPicker } from './EmojiPicker';
import { FilePreview } from './FilePreview';

interface MessageComposerProps {
  onSendMessage: (message: IMessage) => void;
  currentUserId: string;
  recipientId: string;
  isTyping: boolean;
  onTyping: (isTyping: boolean) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  currentUserId,
  recipientId,
  isTyping,
  onTyping,
}) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expiration, setExpiration] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setIsSending(true);
    setError(null);

    try {
      const message: IMessage = {
        id: Date.now().toString(),
        content,
        senderId: currentUserId,
        recipientId,
        timestamp: new Date().toISOString(),
        status: 'sending',
        files: files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        expiresAt: expiration ? new Date(expiration).toISOString() : undefined,
      };

      await onSendMessage(message);
      setContent('');
      setFiles([]);
      setExpiration('');
      setShowEmojiPicker(false);
    } catch (err) {
      setError('Nepodařilo se odeslat zprávu');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (content.trim()) {
      onTyping(true);
      const timer = setTimeout(() => onTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      onTyping(false);
    }
  }, [content, onTyping]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napište zprávu..."
            className="input min-h-[80px] max-h-[200px] resize-y"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="btn btn-outlined"
            aria-label="Vložit emoji"
          >
            😊
          </button>

          <input
            type="file"
            id="file-upload"
            onChange={handleFileSelect}
            multiple
            className="hidden"
            aria-label="Přidat přílohu"
          />
          <label
            htmlFor="file-upload"
            className="btn btn-outlined cursor-pointer"
          >
            📎
          </label>

          <button
            type="submit"
            disabled={isSending || (!content.trim() && files.length === 0)}
            className="btn btn-primary"
          >
            {isSending ? 'Odesílám...' : 'Odeslat'}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="datetime-local"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="input"
            placeholder="Platnost zprávy (volitelné)"
          />
        </div>
      </div>

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={(emoji) => {
            setContent(content + emoji);
            setShowEmojiPicker(false);
            inputRef.current?.focus();
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {error && (
        <div className="notification notification-error" role="alert">
          {error}
        </div>
      )}

      {isTyping && (
        <div className="text-sm text-gray-500">Píše...</div>
      )}
    </form>
  );
}; 