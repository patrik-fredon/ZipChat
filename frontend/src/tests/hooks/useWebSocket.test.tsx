import { act, renderHook } from '@testing-library/react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { webSocketClient } from '../../services/websocket/client';

// Mock WebSocketClient
vi.mock('../../services/websocket/client', () => ({
  webSocketClient: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect on mount and disconnect on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket());

    expect(webSocketClient.connect).toHaveBeenCalledTimes(1);

    unmount();

    expect(webSocketClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should send messages', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.sendMessage('Hello');
    });

    expect(webSocketClient.send).toHaveBeenCalledWith({
      type: 'chat',
      data: { message: 'Hello' }
    });
  });

  it('should send typing status', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.sendTyping(true);
    });

    expect(webSocketClient.send).toHaveBeenCalledWith({
      type: 'typing',
      data: { isTyping: true }
    });
  });

  it('should handle message events', () => {
    const messageHandler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.onMessage(messageHandler);
    });

    expect(webSocketClient.on).toHaveBeenCalledWith('chat', messageHandler);
  });

  it('should handle typing events', () => {
    const typingHandler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.onTyping(typingHandler);
    });

    expect(webSocketClient.on).toHaveBeenCalledWith('typing', typingHandler);
  });

  it('should handle connection events', () => {
    const connectionHandler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.onConnected(connectionHandler);
    });

    expect(webSocketClient.on).toHaveBeenCalledWith('connected', connectionHandler);
  });

  it('should handle disconnection events', () => {
    const disconnectionHandler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.onDisconnected(disconnectionHandler);
    });

    expect(webSocketClient.on).toHaveBeenCalledWith('disconnected', disconnectionHandler);
  });

  it('should handle error events', () => {
    const errorHandler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.onError(errorHandler);
    });

    expect(webSocketClient.on).toHaveBeenCalledWith('error', errorHandler);
  });

  it('should cleanup event listeners on unmount', () => {
    const { result, unmount } = renderHook(() => useWebSocket());

    const messageHandler = vi.fn();
    const typingHandler = vi.fn();
    const connectionHandler = vi.fn();
    const disconnectionHandler = vi.fn();
    const errorHandler = vi.fn();

    act(() => {
      result.current.onMessage(messageHandler);
      result.current.onTyping(typingHandler);
      result.current.onConnected(connectionHandler);
      result.current.onDisconnected(disconnectionHandler);
      result.current.onError(errorHandler);
    });

    unmount();

    expect(webSocketClient.off).toHaveBeenCalledTimes(5);
  });

  it('should handle reconnection attempts', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.onDisconnected(() => {
        // Simulate reconnection
        result.current.onConnected(() => {
          expect(webSocketClient.connect).toHaveBeenCalledTimes(2);
        });
      });
    });
  });

  it('should handle message queue when disconnected', () => {
    const { result } = renderHook(() => useWebSocket());

    // Simulate disconnection
    act(() => {
      result.current.onDisconnected(() => {
        result.current.sendMessage('Queued message');
        expect(webSocketClient.send).not.toHaveBeenCalled();
      });
    });

    // Simulate reconnection
    act(() => {
      result.current.onConnected(() => {
        expect(webSocketClient.send).toHaveBeenCalledWith({
          type: 'chat',
          data: { message: 'Queued message' }
        });
      });
    });
  });
}); 