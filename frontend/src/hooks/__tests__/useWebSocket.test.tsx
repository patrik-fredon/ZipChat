import { act, renderHook } from '@testing-library/react-hooks';
import { useWebSocket } from '../useWebSocket';

jest.mock('../useAuth', () => ({
  useAuth: () => ({
    token: 'test-token'
  })
}));

describe('useWebSocket', () => {
  let mockWebSocket: jest.Mocked<WebSocket>;

  beforeEach(() => {
    mockWebSocket = new WebSocket('ws://localhost') as jest.Mocked<WebSocket>;
    (global as any).WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should connect to WebSocket on mount', () => {
    renderHook(() => useWebSocket('ws://localhost'));

    expect(WebSocket).toHaveBeenCalledWith('ws://localhost?token=test-token');
  });

  it('should set connected state when connection is established', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));

    act(() => {
      mockWebSocket.onopen?.({} as Event);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle connection errors', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));

    act(() => {
      mockWebSocket.onerror?.({} as Event);
    });

    expect(result.current.error).toBe('Chyba WebSocket připojení');
  });

  it('should attempt to reconnect on connection close', () => {
    renderHook(() => useWebSocket('ws://localhost'));

    act(() => {
      mockWebSocket.onclose?.({} as CloseEvent);
    });

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('should send messages when connected', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));

    act(() => {
      mockWebSocket.onopen?.({} as Event);
      result.current.send('test_event', { test: 'data' });
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: 'test_event', data: { test: 'data' } })
    );
  });

  it('should not send messages when disconnected', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));

    act(() => {
      mockWebSocket.readyState = WebSocket.CLOSED;
      result.current.send('test_event', { test: 'data' });
    });

    expect(mockWebSocket.send).not.toHaveBeenCalled();
    expect(result.current.error).toBe('WebSocket není připojen');
  });

  it('should handle incoming messages', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    const callback = jest.fn();

    act(() => {
      result.current.addEventListener('test_event', callback);
      mockWebSocket.onmessage?.({
        data: JSON.stringify({ event: 'test_event', data: { test: 'data' } })
      } as MessageEvent);
    });

    expect(callback).toHaveBeenCalledWith({ test: 'data' });
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket('ws://localhost'));

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });
}); 