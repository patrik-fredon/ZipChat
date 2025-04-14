import { renderHook, act } from '@testing-library/react';
import { usePushNotifications } from '../usePushNotifications';
import { logger } from '../../utils/logger';
import { api } from '../../services/api';

// Mock dependencies
vi.mock('../../utils/logger');
vi.mock('../../services/api');

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Notification API
    global.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted')
    } as any;
    // Mock ServiceWorker
    global.navigator.serviceWorker = {
      ready: Promise.resolve({
        pushManager: {
          subscribe: vi.fn().mockResolvedValue({
            toJSON: () => ({ endpoint: 'test-endpoint' })
          })
        }
      })
    } as any;
  });

  it('should initialize with correct initial state', () => {
    const { result } = renderHook(() => usePushNotifications());
    
    expect(result.current).toEqual({
      isSupported: false,
      isPermissionGranted: false,
      token: null,
      error: null,
      requestPermission: expect.any(Function),
      registerToken: expect.any(Function),
      unregisterToken: expect.any(Function)
    });
  });

  it('should check browser support', async () => {
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      result.current.checkSupport();
    });

    expect(result.current.isSupported).toBe(true);
  });

  it('should handle unsupported browser', async () => {
    // Mock unsupported browser
    delete (global as any).Notification;
    delete (global as any).navigator.serviceWorker;

    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      result.current.checkSupport();
    });

    expect(result.current.isSupported).toBe(false);
    expect(result.current.error).toBe('Push notifications are not supported in this browser');
  });

  it('should check notification permission', async () => {
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await result.current.checkPermission();
    });

    expect(result.current.isPermissionGranted).toBe(true);
  });

  it('should request notification permission', async () => {
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.isPermissionGranted).toBe(true);
    expect(Notification.requestPermission).toHaveBeenCalled();
  });

  it('should register push notification token', async () => {
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await result.current.registerToken();
    });

    expect(result.current.token).toBe('test-endpoint');
    expect(api.post).toHaveBeenCalledWith('/notifications/fcm-token', {
      token: { endpoint: 'test-endpoint' },
      deviceId: navigator.userAgent,
      platform: 'web'
    });
  });

  it('should unregister push notification token', async () => {
    const { result } = renderHook(() => usePushNotifications());
    
    // First register a token
    await act(async () => {
      await result.current.registerToken();
    });

    // Then unregister it
    await act(async () => {
      await result.current.unregisterToken();
    });

    expect(result.current.token).toBeNull();
    expect(api.delete).toHaveBeenCalledWith('/notifications/fcm-token', {
      data: { token: 'test-endpoint' }
    });
  });

  it('should handle errors during token registration', async () => {
    // Mock error during registration
    (api.post as any).mockRejectedValue(new Error('Registration failed'));

    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await result.current.registerToken();
    });

    expect(result.current.error).toBe('Failed to register push notification token');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle errors during token unregistration', async () => {
    // Mock error during unregistration
    (api.delete as any).mockRejectedValue(new Error('Unregistration failed'));

    const { result } = renderHook(() => usePushNotifications());
    
    // First register a token
    await act(async () => {
      await result.current.registerToken();
    });

    // Then try to unregister it
    await act(async () => {
      await result.current.unregisterToken();
    });

    expect(result.current.error).toBe('Failed to unregister push notification token');
    expect(logger.error).toHaveBeenCalled();
  });
}); 
}); 