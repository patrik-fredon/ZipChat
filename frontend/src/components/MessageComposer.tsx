import React, { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { EmojiPicker } from './EmojiPicker';
import { FilePreview } from './FilePreview';

interface MessageComposerProps {
  currentUserId: string;
  recipientId: string;
  onSendMessage: (content: string, attachments?: File[]) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  currentUserId,
  recipientId,
  onSendMessage
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ukládání konceptu zprávy
  const [draft, setDraft] = useLocalStorage(`message_draft_${recipientId}`, '');

  // Indikátor psaní
  const { isTyping, handleTyping } = useTypingIndicator(currentUserId, recipientId);

  // Automatické zvětšování textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Načtení konceptu při změně příjemce
  useEffect(() => {
    setContent(draft);
  }, [recipientId, draft]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setDraft(newContent);
    handleTyping(newContent.length > 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
    setDraft(prev => prev + emoji);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || attachments.length > 0) {
      onSendMessage(content, attachments);
      setContent('');
      setDraft('');
      setAttachments([]);
      handleTyping(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 space-y-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => handleRemoveAttachment(index)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          😊
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          📎
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Napište zprávu..."
          className="flex-1 min-h-[40px] max-h-[200px] p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
        />

        <button
          type="submit"
          disabled={!content.trim() && attachments.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Odeslat
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </form>
  );
}; 