import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { emojis } from '../../utils/emojis';
import { EmojiPicker } from '../EmojiPicker';

describe('EmojiPicker', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<EmojiPicker onSelect={mockOnSelect} />);

    expect(screen.getByPlaceholderText('Hledat emoji...')).toBeInTheDocument();
    expect(screen.getByText(emojis[0].char)).toBeInTheDocument();
  });

  it('filters emojis based on search', () => {
    render(<EmojiPicker onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Hledat emoji...');
    fireEvent.change(searchInput, { target: { value: 'smile' } });

    const filteredEmojis = emojis.filter(emoji =>
      emoji.name.toLowerCase().includes('smile')
    );

    filteredEmojis.forEach(emoji => {
      expect(screen.getByText(emoji.char)).toBeInTheDocument();
    });
  });

  it('calls onSelect when emoji is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} />);

    const emojiButton = screen.getByText(emojis[0].char);
    fireEvent.click(emojiButton);

    expect(mockOnSelect).toHaveBeenCalledWith(emojis[0].char);
  });

  it('shows all emojis when search is empty', () => {
    render(<EmojiPicker onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Hledat emoji...');
    fireEvent.change(searchInput, { target: { value: '' } });

    emojis.forEach(emoji => {
      expect(screen.getByText(emoji.char)).toBeInTheDocument();
    });
  });

  it('shows no results when search has no matches', () => {
    render(<EmojiPicker onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Hledat emoji...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    emojis.forEach(emoji => {
      expect(screen.queryByText(emoji.char)).not.toBeInTheDocument();
    });
  });

  it('shows emoji names as tooltips', () => {
    render(<EmojiPicker onSelect={mockOnSelect} />);

    const emojiButton = screen.getByText(emojis[0].char);
    expect(emojiButton).toHaveAttribute('title', emojis[0].name);
  });
}); 