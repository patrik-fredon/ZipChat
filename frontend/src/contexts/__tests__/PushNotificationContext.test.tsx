import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { logger } from '../../utils/logger';
import { PushNotificationProvider, usePushNotificationContext } from '../PushNotificationContext';

// Mock usePushNotifications hook
vi.mock('../../hooks/usePushNotifications', () => ({
  usePushNotifications: vi.fn()
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}));

const TestComponent = () => {
  const context = usePushNotificationContext();
  return <div data-testid="context-value">{JSON.stringify(context)}</div>;
};

describe('PushNotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide context values', () => {
    const mockContext = {
      isSupported: true,
      isPermissionGranted: true,
      token: 'test-token',
      error: null,
      requestPermission: vi.fn(),
      registerToken: vi.fn(),
      unregisterToken: vi.fn()
    };

    (usePushNotifications as any).mockReturnValue(mockContext);

    render(
      <PushNotificationProvider>
        <TestComponent />
      </PushNotificationProvider>
    );

    expect(screen.getByTestId('context-value').textContent).toContain('test-token');
  });

  it('should throw error when used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      try {
        usePushNotificationContext();
        return <div>No error</div>;
      } catch (error) {
        return <div>Error thrown</div>;
      }
    };

    render(<TestComponentWithoutProvider />);
    expect(screen.getByText('Error thrown')).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle async operations', async () => {
    const mockContext = {
      isSupported: true,
      isPermissionGranted: true,
      token: 'test-token',
      error: null,
      requestPermission: vi.fn().mockResolvedValue(true),
      registerToken: vi.fn().mockResolvedValue('new-token'),
      unregisterToken: vi.fn().mockResolvedValue(undefined)
    };

    (usePushNotifications as any).mockReturnValue(mockContext);

    render(
      <PushNotificationProvider>
        <TestComponent />
      </PushNotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('context-value').textContent).toContain('test-token');
    });
  });

  it('should handle error states', () => {
    const mockContext = {
      isSupported: true,
      isPermissionGranted: false,
      token: null,
      error: 'Permission denied',
      requestPermission: vi.fn(),
      registerToken: vi.fn(),
      unregisterToken: vi.fn()
    };

    (usePushNotifications as any).mockReturnValue(mockContext);

    render(
      <PushNotificationProvider>
        <TestComponent />
      </PushNotificationProvider>
    );

    expect(screen.getByTestId('context-value').textContent).toContain('Permission denied');
  });
}); 