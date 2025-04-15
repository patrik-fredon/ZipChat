import { useCallback, useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
	type: string;
	data: any;
}

interface UseWebSocketReturn {
	isConnected: boolean;
	sendMessage: (type: string, data: any) => void;
	subscribe: (type: string, callback: (data: any) => void) => void;
	unsubscribe: (type: string) => void;
}

export const useWebSocket = (url: string = 'ws://localhost:3001'): UseWebSocketReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const callbacksRef = useRef<Map<string, ((data: any) => void)[]>>(new Map());

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		const ws = new WebSocket(url);

		ws.onopen = () => {
			setIsConnected(true);
			console.log('WebSocket connected');
		};

		ws.onclose = () => {
			setIsConnected(false);
			console.log('WebSocket disconnected');
			// Reconnect after 5 seconds
			setTimeout(connect, 5000);
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		ws.onmessage = (event) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				const callbacks = callbacksRef.current.get(message.type) || [];
				callbacks.forEach(callback => callback(message.data));
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		wsRef.current = ws;
	}, [url]);

	useEffect(() => {
		connect();
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, [connect]);

	const sendMessage = useCallback((type: string, data: any) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ type, data }));
		} else {
			console.error('WebSocket is not connected');
		}
	}, []);

	const subscribe = useCallback((type: string, callback: (data: any) => void) => {
		const callbacks = callbacksRef.current.get(type) || [];
		callbacksRef.current.set(type, [...callbacks, callback]);
	}, []);

	const unsubscribe = useCallback((type: string) => {
		callbacksRef.current.delete(type);
	}, []);

	return {
		isConnected,
		sendMessage,
		subscribe,
		unsubscribe,
	};
};
