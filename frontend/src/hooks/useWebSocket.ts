import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
	type: string;
	data: any;
}

export const useWebSocket = (url: string = 'ws://localhost:3000') => {
	const { token } = useAuth();
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<WebSocketMessage[]>([]);
	const [error, setError] = useState<string | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

	const connect = useCallback(() => {
		if (socket?.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			const wsUrl = `${url}?token=${token}`;
			const ws = new WebSocket(wsUrl);

			ws.onopen = () => {
				setIsConnected(true);
				setError(null);
				console.log('WebSocket připojení navázáno');
			};

			ws.onclose = () => {
				setIsConnected(false);
				console.log('WebSocket připojení ukončeno');
				reconnect();
			};

			ws.onerror = (event) => {
				setError('Chyba WebSocket připojení');
				console.error('WebSocket chyba:', event);
			};

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					setMessages(prev => [...prev, message]);
				} catch (err) {
					console.error('Chyba při zpracování WebSocket zprávy:', err);
				}
			};

			setSocket(ws);

			return () => {
				ws.close();
			};
		} catch (err) {
			setError('Chyba při vytváření WebSocket připojení');
			console.error('Chyba při vytváření WebSocket:', err);
			reconnect();
		}
	}, [token, url]);

	const reconnect = () => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}

		reconnectTimeoutRef.current = setTimeout(() => {
			console.log('Pokus o opětovné připojení...');
			connect();
		}, 5000);
	};

	const send = useCallback((message: WebSocketMessage) => {
		if (socket && isConnected) {
			socket.send(JSON.stringify(message));
		} else {
			setError('WebSocket není připojen');
		}
	}, [socket, isConnected]);

	const subscribe = useCallback((type: string, callback: (data: any) => void) => {
		if (socket && isConnected) {
			const message = { type: 'subscribe', data: { type } };
			socket.send(JSON.stringify(message));

			const unsubscribe = () => {
				if (socket && isConnected) {
					const message = { type: 'unsubscribe', data: { type } };
					socket.send(JSON.stringify(message));
				}
			};

			return unsubscribe;
		}
	}, [socket, isConnected]);

	useEffect(() => {
		const cleanup = connect();
		return cleanup;
	}, [connect]);

	return {
		isConnected,
		error,
		messages,
		send,
		subscribe,
	};
};
