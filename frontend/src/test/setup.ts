import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatic cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock for WebSocket
class MockWebSocket {
	onopen: (() => void) | null = null;
	onmessage: ((event: { data: string }) => void) | null = null;
	onclose: ((event: { code: number; reason: string }) => void) | null = null;
	onerror: ((error: any) => void) | null = null;
	readyState = WebSocket.OPEN;
	send = vi.fn();
	close = vi.fn();

	constructor(url: string) {
		this.url = url;
	}
}

// Global mock for WebSocket
global.WebSocket = MockWebSocket as any;

// Mock for localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

// Mock for fetch
global.fetch = vi.fn();

// Mock for requestAnimationFrame
global.requestAnimationFrame = (callback) => {
	return setTimeout(callback, 0);
};

// Mock for cancelAnimationFrame
global.cancelAnimationFrame = (id) => {
	clearTimeout(id);
};
