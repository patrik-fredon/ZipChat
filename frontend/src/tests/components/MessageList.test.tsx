import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MessageList } from '../../components/messages/MessageList';

describe('MessageList', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Test message 1',
      senderId: 'user1',
      recipientId: 'user2',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      status: 'sent'
    },
    {
      id: '2',
      content: 'Test message 2',
      senderId: 'user2',
      recipientId: 'user1',
      createdAt: new Date('2024-01-01T00:01:00Z'),
      status: 'delivered'
    }
  ];

  const mockOnLoadMore = vi.fn();
  const mockOnMessageRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MessageList
        messages={mockMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(
      <MessageList
        messages={mockMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={true}
      />
    );

    expect(screen.getByText('Načítání...')).toBeInTheDocument();
  });

  it('handles load more', async () => {
    render(
      <MessageList
        messages={mockMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={false}
      />
    );

    const loadMoreButton = screen.getByText('Načíst starší zprávy');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalled();
    });
  });

  it('handles message read', async () => {
    render(
      <MessageList
        messages={mockMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={false}
      />
    );

    const message = screen.getByText('Test message 1');
    fireEvent.mouseEnter(message);

    await waitFor(() => {
      expect(mockOnMessageRead).toHaveBeenCalledWith('1');
    });
  });

  it('handles empty state', () => {
    render(
      <MessageList
        messages={[]}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={false}
        isLoading={false}
      />
    );

    expect(screen.getByText('Žádné zprávy')).toBeInTheDocument();
  });

  it('handles message status indicators', () => {
    render(
      <MessageList
        messages={mockMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('Odesláno')).toBeInTheDocument();
    expect(screen.getByText('Doručeno')).toBeInTheDocument();
  });

  it('handles message timestamps', () => {
    render(
      <MessageList
        messages={mockMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('00:01')).toBeInTheDocument();
  });

  it('handles message grouping', () => {
    const groupedMessages = [
      ...mockMessages,
      {
        id: '3',
        content: 'Test message 3',
        senderId: 'user1',
        recipientId: 'user2',
        createdAt: new Date('2024-01-01T00:02:00Z'),
        status: 'sent'
      }
    ];

    render(
      <MessageList
        messages={groupedMessages}
        onLoadMore={mockOnLoadMore}
        onMessageRead={mockOnMessageRead}
        hasMore={true}
        isLoading={false}
      />
    );

    const messageGroups = screen.getAllByTestId('message-group');
    expect(messageGroups).toHaveLength(2);
  });
}); 