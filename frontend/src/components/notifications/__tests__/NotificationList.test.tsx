import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { NotificationList } from '../NotificationList';

jest.mock('../../../hooks/useWebSocket');
jest.mock('react-i18next');

const mockNotifications = [
  {
    _id: '1',
    userId: 'user123',
    type: 'message',
    title: 'New Message',
    content: 'You have a new message',
    read: false,
    createdAt: new Date()
  },
  {
    _id: '2',
    userId: 'user123',
    type: 'friend_request',
    title: 'Friend Request',
    content: 'You have a new friend request',
    read: true,
    createdAt: new Date()
  }
];

describe('NotificationList', () => {
  beforeEach(() => {
    (useWebSocket as jest.Mock).mockReturnValue({
      socket: {
        on: jest.fn(),
        off: jest.fn()
      }
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ notifications: mockNotifications, total: 2 })
      })
    );
  });

  it('renders notifications correctly', async () => {
    render(<NotificationList userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('New Message')).toBeInTheDocument();
      expect(screen.getByText('Friend Request')).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ notifications: [], total: 0 })
      })
    );

    render(<NotificationList userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('notifications.empty')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(<NotificationList userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('notifications.error.loading')).toBeInTheDocument();
    });
  });

  it('handles WebSocket updates', async () => {
    const mockSocket = {
      on: jest.fn(),
      off: jest.fn()
    };

    (useWebSocket as jest.Mock).mockReturnValue({ socket: mockSocket });

    render(<NotificationList userId="user123" />);

    expect(mockSocket.on).toHaveBeenCalledWith('new_notification', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('notifications_read', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('notifications_deleted', expect.any(Function));
  });
}); 