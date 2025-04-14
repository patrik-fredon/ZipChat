import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationPreferences } from '../NotificationPreferences';

jest.mock('react-i18next');

const mockPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  notificationTypes: {
    message: true,
    friendRequest: true,
    system: true,
    security: true
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  }
};

describe('NotificationPreferences', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });

    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/preferences/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPreferences)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockPreferences, emailNotifications: false })
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<NotificationPreferences userId="123" />);
    expect(screen.getByText('notifications.preferences.loading')).toBeInTheDocument();
  });

  it('should render preferences when loaded', async () => {
    render(<NotificationPreferences userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('notifications.preferences.title')).toBeInTheDocument();
      expect(screen.getByText('notifications.preferences.email')).toBeInTheDocument();
      expect(screen.getByText('notifications.preferences.push')).toBeInTheDocument();
      expect(screen.getByText('notifications.preferences.inApp')).toBeInTheDocument();
    });
  });

  it('should update preferences when toggled', async () => {
    render(<NotificationPreferences userId="123" />);

    await waitFor(() => {
      const emailSwitch = screen.getByRole('switch', { name: /email/i });
      fireEvent.click(emailSwitch);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notifications/preferences/123',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should show error when loading fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Failed to load')));

    render(<NotificationPreferences userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('notifications.preferences.error.loading')).toBeInTheDocument();
    });
  });

  it('should show error when update fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockPreferences)
    })).mockImplementationOnce(() => Promise.reject(new Error('Failed to update')));

    render(<NotificationPreferences userId="123" />);

    await waitFor(() => {
      const emailSwitch = screen.getByRole('switch', { name: /email/i });
      fireEvent.click(emailSwitch);
    });

    expect(screen.getByText('notifications.preferences.error.updating')).toBeInTheDocument();
  });

  it('should show quiet hours time inputs when enabled', async () => {
    render(<NotificationPreferences userId="123" />);

    await waitFor(() => {
      const quietHoursSwitch = screen.getByRole('switch', { name: /quietHours.enabled/i });
      fireEvent.click(quietHoursSwitch);
    });

    expect(screen.getByRole('textbox', { name: /startTime/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /endTime/i })).toBeInTheDocument();
  });
}); 