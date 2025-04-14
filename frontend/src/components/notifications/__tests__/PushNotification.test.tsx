import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import { PushNotification } from '../PushNotification';

// Mock hooks
jest.mock('../../../hooks/usePushNotifications');
jest.mock('react-i18next');

describe('PushNotification', () => {
  const mockUsePushNotifications = {
    isSupported: true,
    isPermissionGranted: false,
    token: null,
    error: null,
    requestPermission: jest.fn(),
    registerToken: jest.fn(),
    unregisterToken: jest.fn()
  };

  beforeEach(() => {
    (usePushNotifications as jest.Mock).mockReturnValue(mockUsePushNotifications);
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with unsupported browser message', () => {
    (usePushNotifications as jest.Mock).mockReturnValue({
      ...mockUsePushNotifications,
      isSupported: false
    });

    render(<PushNotification userId="user1" />);
    expect(screen.getByText('notifications.push.unsupported')).toBeInTheDocument();
  });

  it('should render with permission request', () => {
    render(<PushNotification userId="user1" />);

    expect(screen.getByText('notifications.push.permissionRequired')).toBeInTheDocument();
    expect(screen.getByText('notifications.push.requestPermission')).toBeInTheDocument();
  });

  it('should render with enabled notifications', () => {
    (usePushNotifications as jest.Mock).mockReturnValue({
      ...mockUsePushNotifications,
      isPermissionGranted: true,
      token: 'test-token'
    });

    render(<PushNotification userId="user1" />);

    expect(screen.getByText('notifications.push.enabled')).toBeInTheDocument();
    expect(screen.getByText('notifications.push.disable')).toBeInTheDocument();
  });

  it('should render with disabled notifications', () => {
    (usePushNotifications as jest.Mock).mockReturnValue({
      ...mockUsePushNotifications,
      isPermissionGranted: true,
      token: null
    });

    render(<PushNotification userId="user1" />);

    expect(screen.getByText('notifications.push.disabled')).toBeInTheDocument();
    expect(screen.getByText('notifications.push.enable')).toBeInTheDocument();
  });

  it('should handle permission request', async () => {
    render(<PushNotification userId="user1" />);

    const requestButton = screen.getByText('notifications.push.requestPermission');
    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(mockUsePushNotifications.requestPermission).toHaveBeenCalled();
    });
  });

  it('should handle enabling notifications', async () => {
    (usePushNotifications as jest.Mock).mockReturnValue({
      ...mockUsePushNotifications,
      isPermissionGranted: true,
      token: null
    });

    render(<PushNotification userId="user1" />);

    const enableButton = screen.getByText('notifications.push.enable');
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockUsePushNotifications.registerToken).toHaveBeenCalled();
    });
  });

  it('should handle disabling notifications', async () => {
    (usePushNotifications as jest.Mock).mockReturnValue({
      ...mockUsePushNotifications,
      isPermissionGranted: true,
      token: 'test-token'
    });

    render(<PushNotification userId="user1" />);

    const disableButton = screen.getByText('notifications.push.disable');
    fireEvent.click(disableButton);

    await waitFor(() => {
      expect(mockUsePushNotifications.unregisterToken).toHaveBeenCalled();
    });
  });

  it('should display error message', () => {
    (usePushNotifications as jest.Mock).mockReturnValue({
      ...mockUsePushNotifications,
      error: 'Test error'
    });

    render(<PushNotification userId="user1" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
}); 