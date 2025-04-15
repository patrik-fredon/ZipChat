import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatické čištění po každém testu
afterEach(() => {
	cleanup();
});

// Mock pro WebSocket
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

// Globální mock pro WebSocket
global.WebSocket = MockWebSocket as any;

// Mock pro localStorage
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

// Mock pro fetch
global.fetch = vi.fn();

// Mock pro requestAnimationFrame
global.requestAnimationFrame = (callback) => {
	return setTimeout(callback, 0);
};

// Mock pro cancelAnimationFrame
global.cancelAnimationFrame = (id) => {
	clearTimeout(id);
};
