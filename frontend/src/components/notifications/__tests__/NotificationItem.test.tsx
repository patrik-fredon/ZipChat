import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationItem } from '../NotificationItem';

jest.mock('react-i18next');

const mockNotification = {
  _id: '1',
  userId: 'user123',
  type: 'message',
  title: 'New Message',
  content: 'You have a new message',
  read: false,
  createdAt: new Date()
};

describe('NotificationItem', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });
  });

  it('renders notification correctly', () => {
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();

    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('New Message')).toBeInTheDocument();
    expect(screen.getByText('You have a new message')).toBeInTheDocument();
  });

  it('handles mark as read action', () => {
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();

    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByTitle('notifications.markAsRead'));
    expect(onMarkAsRead).toHaveBeenCalledWith(['1']);
  });

  it('handles delete action', () => {
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();

    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByTitle('notifications.delete'));
    expect(onDelete).toHaveBeenCalledWith(['1']);
  });

  it('shows different styles for read/unread notifications', () => {
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();

    const { rerender } = render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    // Unread notification should have blue border
    expect(screen.getByText('New Message').closest('div')).toHaveClass('border-blue-200');

    // Rerender with read notification
    rerender(
      <NotificationItem
        notification={{ ...mockNotification, read: true }}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    // Read notification should have gray border
    expect(screen.getByText('New Message').closest('div')).toHaveClass('border-gray-200');
  });

  it('shows different icons for different notification types', () => {
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();

    const { rerender } = render(
      <NotificationItem
        notification={{ ...mockNotification, type: 'message' }}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId('notification-icon')).toHaveClass('text-blue-500');

    rerender(
      <NotificationItem
        notification={{ ...mockNotification, type: 'friend_request' }}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId('notification-icon')).toHaveClass('text-green-500');

    rerender(
      <NotificationItem
        notification={{ ...mockNotification, type: 'system' }}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId('notification-icon')).toHaveClass('text-yellow-500');

    rerender(
      <NotificationItem
        notification={{ ...mockNotification, type: 'security' }}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId('notification-icon')).toHaveClass('text-red-500');
  });
}); 