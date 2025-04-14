import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IMessage } from '../../types/message';
import { MessageList } from '../MessageList';

const mockMessages: IMessage[] = [
  {
    id: '1',
    content: 'První zpráva',
    senderId: 'user1',
    recipientId: 'user2',
    timestamp: new Date('2024-01-01T12:00:00'),
    status: 'sent',
    isRead: false
  },
  {
    id: '2',
    content: 'Druhá zpráva',
    senderId: 'user2',
    recipientId: 'user1',
    timestamp: new Date('2024-01-01T12:01:00'),
    status: 'delivered',
    isRead: true
  }
];

describe('MessageList', () => {
  const mockCurrentUserId = 'user1';
  const mockOnLoadMore = jest.fn();
  const mockOnMessageRead = jest.fn();
  const mockOnMessageSelect = jest.fn();
  const mockOnMessageDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders messages correctly', () => {
    render(
      <MessageList
        messages={mockMessages}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    expect(screen.getByText('První zpráva')).toBeInTheDocument();
    expect(screen.getByText('Druhá zpráva')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <MessageList
        messages={[]}
        currentUserId={mockCurrentUserId}
        isLoading={true}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(
      <MessageList
        messages={[]}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    expect(screen.getByText('Žádné zprávy')).toBeInTheDocument();
  });

  it('groups messages by date', () => {
    const messagesWithDifferentDates = [
      ...mockMessages,
      {
        id: '3',
        content: 'Třetí zpráva',
        senderId: 'user1',
        recipientId: 'user2',
        timestamp: new Date('2024-01-02T12:00:00'),
        status: 'sent',
        isRead: false
      }
    ];

    render(
      <MessageList
        messages={messagesWithDifferentDates}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    expect(screen.getByText('1. ledna 2024')).toBeInTheDocument();
    expect(screen.getByText('2. ledna 2024')).toBeInTheDocument();
  });

  it('calls onLoadMore when scrolling to bottom', async () => {
    render(
      <MessageList
        messages={mockMessages}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={true}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    const listContainer = screen.getByTestId('message-list');
    fireEvent.scroll(listContainer, { target: { scrollTop: 1000 } });

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalled();
    });
  });

  it('calls onMessageRead when message is in view', async () => {
    render(
      <MessageList
        messages={mockMessages}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    const messageElement = screen.getByText('První zpráva');
    fireEvent.scroll(messageElement, { target: { isIntersecting: true } });

    await waitFor(() => {
      expect(mockOnMessageRead).toHaveBeenCalledWith('1');
    });
  });

  it('handles message selection', () => {
    render(
      <MessageList
        messages={mockMessages}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    const messageElement = screen.getByText('První zpráva');
    fireEvent.click(messageElement);

    expect(mockOnMessageSelect).toHaveBeenCalledWith('1');
  });

  it('handles message deletion', () => {
    render(
      <MessageList
        messages={mockMessages}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    expect(mockOnMessageDelete).toHaveBeenCalledWith('1');
  });

  it('shows different message statuses', () => {
    render(
      <MessageList
        messages={mockMessages}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    expect(screen.getByTestId('status-indicator-1')).toHaveAttribute('data-status', 'sent');
    expect(screen.getByTestId('status-indicator-2')).toHaveAttribute('data-status', 'delivered');
  });

  it('handles attachments in messages', () => {
    const messagesWithAttachments = [
      {
        ...mockMessages[0],
        attachments: [
          { name: 'test.txt', size: 1024, type: 'text/plain' }
        ]
      }
    ];

    render(
      <MessageList
        messages={messagesWithAttachments}
        currentUserId={mockCurrentUserId}
        isLoading={false}
        hasMore={false}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        onMessageSelect={mockOnMessageSelect}
        onMessageDelete={mockOnMessageDelete}
      />
    );

    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });
}); 