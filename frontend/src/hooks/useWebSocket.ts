import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
	event: string;
	data: any;
}

export const useWebSocket = (url: string) => {
	const { token } = useAuth();
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

	const connect = () => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
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

			wsRef.current = ws;
		} catch (err) {
			setError('Chyba při vytváření WebSocket připojení');
			console.error('Chyba při vytváření WebSocket:', err);
			reconnect();
		}
	};

	const reconnect = () => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}

		reconnectTimeoutRef.current = setTimeout(() => {
			console.log('Pokus o opětovné připojení...');
			connect();
		}, 5000);
	};

	const send = (event: string, data: any) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ event, data }));
		} else {
			setError('WebSocket není připojen');
		}
	};

	const addEventListener = (event: string, callback: (data: any) => void) => {
		if (!wsRef.current) return;

		const messageHandler = (event: MessageEvent) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				if (message.event === event) {
					callback(message.data);
				}
			} catch (err) {
				console.error('Chyba při zpracování WebSocket zprávy:', err);
			}
		};

		wsRef.current.addEventListener('message', messageHandler);

		return () => {
			wsRef.current?.removeEventListener('message', messageHandler);
		};
	};

	useEffect(() => {
		connect();

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			wsRef.current?.close();
		};
	}, [token]);

	return {
		isConnected,
		error,
		send,
		addEventListener
	};
};
