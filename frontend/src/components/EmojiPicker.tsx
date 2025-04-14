import React, { useState } from 'react';
import { emojis } from '../utils/emojis';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = emojis.filter(emoji =>
    emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-64">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledat emoji..."
        className="w-full p-2 border rounded-lg mb-2"
      />
      <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
        {filteredEmojis.map((emoji) => (
          <button
            key={emoji.char}
            onClick={() => onSelect(emoji.char)}
            className="p-2 hover:bg-gray-100 rounded-lg text-lg"
            title={emoji.name}
          >
            {emoji.char}
          </button>
        ))}
      </div>
    </div>
  );
}; 