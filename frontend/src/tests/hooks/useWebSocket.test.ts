import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWebSocket } from '../../hooks/useWebSocket';

class MockWebSocket {
	onopen: (() => void) | null = null;
	onclose: (() => void) | null = null;
	onerror: ((event: Event) => void) | null = null;
	readyState = WebSocket.OPEN;
	send = vi.fn();
	close = vi.fn();
}

describe('useWebSocket', () => {
	let mockWs: MockWebSocket;

	beforeEach(() => {
		mockWs = new MockWebSocket();
		// @ts-ignore
		global.WebSocket = vi.fn(() => mockWs);
	});

	it('should connect on mount', () => {
		const onOpen = vi.fn();
		renderHook(() =>
			useWebSocket({
				url: 'ws://localhost:8080',
				onOpen
			})
		);

		act(() => {
			mockWs.onopen?.();
		});

		expect(onOpen).toHaveBeenCalled();
	});

	it('should handle connection error', () => {
		const onError = vi.fn();
		renderHook(() =>
			useWebSocket({
				url: 'ws://localhost:8080',
				onError
			})
		);

		const error = new Event('error');
		act(() => {
			mockWs.onerror?.(error);
		});

		expect(onError).toHaveBeenCalledWith(error);
	});

	it('should send message', () => {
		const { result } = renderHook(() =>
			useWebSocket({
				url: 'ws://localhost:8080'
			})
		);

		act(() => {
			result.current.sendMessage('Hello');
		});

		expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'message', content: 'Hello' }));
	});

	it('should send typing status', () => {
		const { result } = renderHook(() =>
			useWebSocket({
				url: 'ws://localhost:8080'
			})
		);

		act(() => {
			result.current.setTyping(true);
		});

		expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'typing', isTyping: true }));
	});

	it('should handle disconnection', () => {
		const onClose = vi.fn();
		renderHook(() =>
			useWebSocket({
				url: 'ws://localhost:8080',
				onClose
			})
		);

		act(() => {
			mockWs.onclose?.();
		});

		expect(onClose).toHaveBeenCalled();
	});

	it('should cleanup on unmount', () => {
		const { unmount } = renderHook(() =>
			useWebSocket({
				url: 'ws://localhost:8080'
			})
		);

		unmount();

		expect(mockWs.close).toHaveBeenCalled();
	});
});
