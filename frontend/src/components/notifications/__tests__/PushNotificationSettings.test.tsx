import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../hooks/useApi';
import { PushNotificationSettings } from '../PushNotificationSettings';

// Mock hooks
jest.mock('../../../hooks/useApi');
jest.mock('react-i18next');

// Mock Firebase
jest.mock('firebase/messaging', () => ({
  getMessaging: jest.fn(),
  getToken: jest.fn()
}));

describe('PushNotificationSettings', () => {
  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn()
  };

  const mockTokens = [
    {
      id: 'token1',
      deviceId: 'device1',
      platform: 'web',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue(mockApi);
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without tokens', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tokens: [] } });

    render(<PushNotificationSettings userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('notifications.pushSettings.noDevices')).toBeInTheDocument();
    });
  });

  it('should render with tokens', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });

    render(<PushNotificationSettings userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('device1')).toBeInTheDocument();
      expect(screen.getByText('notifications.pushSettings.platform.web')).toBeInTheDocument();
    });
  });

  it('should register new token', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tokens: [] } });
    mockApi.post.mockResolvedValueOnce({});
    mockApi.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });

    render(<PushNotificationSettings userId="user1" />);

    const registerButton = screen.getByText('notifications.pushSettings.registerDevice');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/notifications/fcm-token', {
        token: expect.any(String),
        deviceId: 'web-browser',
        platform: 'web'
      });
    });
  });

  it('should remove token', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });
    mockApi.delete.mockResolvedValueOnce({});
    mockApi.get.mockResolvedValueOnce({ data: { tokens: [] } });

    render(<PushNotificationSettings userId="user1" />);

    await waitFor(() => {
      const removeButton = screen.getByText('notifications.pushSettings.removeDevice');
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith('/notifications/fcm-token', {
        data: { token: 'token1' }
      });
    });
  });

  it('should handle error when loading tokens', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Failed to load tokens'));

    render(<PushNotificationSettings userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('notifications.errors.loadTokens')).toBeInTheDocument();
    });
  });

  it('should handle error when registering token', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tokens: [] } });
    mockApi.post.mockRejectedValueOnce(new Error('Failed to register token'));

    render(<PushNotificationSettings userId="user1" />);

    const registerButton = screen.getByText('notifications.pushSettings.registerDevice');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('notifications.errors.registerToken')).toBeInTheDocument();
    });
  });

  it('should handle error when removing token', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });
    mockApi.delete.mockRejectedValueOnce(new Error('Failed to remove token'));

    render(<PushNotificationSettings userId="user1" />);

    await waitFor(() => {
      const removeButton = screen.getByText('notifications.pushSettings.removeDevice');
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('notifications.errors.removeToken')).toBeInTheDocument();
    });
  });
}); 