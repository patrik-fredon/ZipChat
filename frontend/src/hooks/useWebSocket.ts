import { useCallback, useEffect, useState } from 'react';

interface UseWebSocketOptions {
	url: string;
	reconnectAttempts?: number;
	reconnectInterval?: number;
	onOpen?: () => void;
	onClose?: () => void;
	onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
	sendMessage: (message: string) => void;
	setTyping: (isTyping: boolean) => void;
	isConnected: boolean;
	error: Event | null;
}

export const useWebSocket = ({ url, reconnectAttempts = 3, reconnectInterval = 3000, onOpen, onClose, onError }: UseWebSocketOptions): UseWebSocketReturn => {
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Event | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const connect = useCallback(() => {
		try {
			const websocket = new WebSocket(url);
			setWs(websocket);
		} catch (err) {
			setError(err as Event);
			onError?.(err as Event);
		}
	}, [url, onError]);

	useEffect(() => {
		connect();

		return () => {
			if (ws) {
				ws.close();
			}
		};
	}, [connect]);

	useEffect(() => {
		if (!ws) return;

		ws.onopen = () => {
			setIsConnected(true);
			setRetryCount(0);
			onOpen?.();
		};

		ws.onclose = () => {
			setIsConnected(false);
			onClose?.();

			if (retryCount < reconnectAttempts) {
				setTimeout(() => {
					setRetryCount((prev) => prev + 1);
					connect();
				}, reconnectInterval);
			}
		};

		ws.onerror = (event: Event) => {
			setError(event);
			onError?.(event);
		};

		return () => {
			ws.onopen = null;
			ws.onclose = null;
			ws.onerror = null;
		};
	}, [ws, onOpen, onClose, onError, retryCount, reconnectAttempts, reconnectInterval, connect]);

	const sendMessage = useCallback(
		(message: string) => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: 'message', content: message }));
			}
		},
		[ws]
	);

	const setTyping = useCallback(
		(isTyping: boolean) => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: 'typing', isTyping }));
			}
		},
		[ws]
	);

	return {
		sendMessage,
		setTyping,
		isConnected,
		error
	};
};
