import { useCallback, useEffect, useRef, useState } from 'react';
import { webSocketClient } from '../services/websocket/client';

interface UseWebSocketOptions {
	url?: string;
	autoConnect?: boolean;
	reconnectAttempts?: number;
	reconnectInterval?: number;
}

interface UseWebSocketReturn {
	sendMessage: (message: string) => void;
	sendTyping: (isTyping: boolean) => void;
	onMessage: (callback: (data: any) => void) => () => void;
	onTyping: (callback: (data: any) => void) => () => void;
	onConnected: (callback: () => void) => () => void;
	onDisconnected: (callback: () => void) => () => void;
	onError: (callback: (error: Error) => void) => () => void;
	isConnected: boolean;
	error: Error | null;
}

export const useWebSocket = ({ url, autoConnect = true, reconnectAttempts = 3, reconnectInterval = 3000 }: UseWebSocketOptions = {}): UseWebSocketReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const messageQueue = useRef<string[]>([]);
	const reconnectCount = useRef(0);
	const reconnectTimeout = useRef<NodeJS.Timeout>();

	const connect = useCallback(() => {
		if (url) {
			webSocketClient.connect();
		}
	}, [url]);

	const disconnect = useCallback(() => {
		webSocketClient.disconnect();
	}, []);

	const sendMessage = useCallback(
		(message: string) => {
			if (isConnected) {
				webSocketClient.send({
					type: 'chat',
					data: { message }
				});
			} else {
				messageQueue.current.push(message);
			}
		},
		[isConnected]
	);

	const sendTyping = useCallback(
		(isTyping: boolean) => {
			if (isConnected) {
				webSocketClient.send({
					type: 'typing',
					data: { isTyping }
				});
			}
		},
		[isConnected]
	);

	const processMessageQueue = useCallback(() => {
		while (messageQueue.current.length > 0) {
			const message = messageQueue.current.shift();
			if (message) {
				sendMessage(message);
			}
		}
	}, [sendMessage]);

	const onMessage = useCallback((callback: (data: any) => void) => {
		webSocketClient.on('chat', callback);
		return () => webSocketClient.off('chat', callback);
	}, []);

	const onTyping = useCallback((callback: (data: any) => void) => {
		webSocketClient.on('typing', callback);
		return () => webSocketClient.off('typing', callback);
	}, []);

	const onConnected = useCallback(
		(callback: () => void) => {
			webSocketClient.on('connected', () => {
				setIsConnected(true);
				setError(null);
				reconnectCount.current = 0;
				processMessageQueue();
				callback();
			});
			return () => webSocketClient.off('connected', callback);
		},
		[processMessageQueue]
	);

	const onDisconnected = useCallback(
		(callback: () => void) => {
			webSocketClient.on('disconnected', () => {
				setIsConnected(false);
				if (reconnectCount.current < reconnectAttempts) {
					reconnectTimeout.current = setTimeout(() => {
						reconnectCount.current++;
						connect();
					}, reconnectInterval);
				}
				callback();
			});
			return () => webSocketClient.off('disconnected', callback);
		},
		[connect, reconnectAttempts, reconnectInterval]
	);

	const onError = useCallback((callback: (error: Error) => void) => {
		webSocketClient.on('error', (error: Error) => {
			setError(error);
			callback(error);
		});
		return () => webSocketClient.off('error', callback);
	}, []);

	useEffect(() => {
		if (autoConnect) {
			connect();
		}

		return () => {
			disconnect();
			if (reconnectTimeout.current) {
				clearTimeout(reconnectTimeout.current);
			}
		};
	}, [autoConnect, connect, disconnect]);

	return {
		sendMessage,
		sendTyping,
		onMessage,
		onTyping,
		onConnected,
		onDisconnected,
		onError,
		isConnected,
		error
	};
};
