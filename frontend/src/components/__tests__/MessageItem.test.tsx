import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { IMessage } from '../../types/message';
import { MessageItem } from '../MessageItem';

const mockMessage: IMessage = {
  id: '1',
  content: 'Test message',
  senderId: 'user1',
  recipientId: 'user2',
  timestamp: new Date('2024-01-01T12:00:00'),
  status: 'sent',
  isRead: false
};

describe('MessageItem', () => {
  const mockCurrentUserId = 'user1';
  const mockOnSelect = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('shows different styling for own messages', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const messageContainer = screen.getByTestId('message-container');
    expect(messageContainer).toHaveClass('bg-blue-100');
  });

  it('shows different styling for other messages', () => {
    render(
      <MessageItem
        message={{ ...mockMessage, senderId: 'user2' }}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const messageContainer = screen.getByTestId('message-container');
    expect(messageContainer).toHaveClass('bg-gray-100');
  });

  it('shows status indicators', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const messageContainer = screen.getByTestId('message-container');
    fireEvent.click(messageContainer);

    expect(mockOnSelect).toHaveBeenCalledWith(mockMessage.id);
  });

  it('shows delete button for own messages', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('does not show delete button for other messages', () => {
    render(
      <MessageItem
        message={{ ...mockMessage, senderId: 'user2' }}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockMessage.id);
  });

  it('shows attachments if present', () => {
    const messageWithAttachments = {
      ...mockMessage,
      attachments: [
        { name: 'test.txt', size: 1024, type: 'text/plain' }
      ]
    };

    render(
      <MessageItem
        message={messageWithAttachments}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    render(
      <MessageItem
        message={mockMessage}
        currentUserId={mockCurrentUserId}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('shows different status indicators', () => {
    const statuses = ['sent', 'delivered', 'read'];

    statuses.forEach(status => {
      render(
        <MessageItem
          message={{ ...mockMessage, status }}
          currentUserId={mockCurrentUserId}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('status-indicator')).toHaveAttribute('data-status', status);
    });
  });
}); 