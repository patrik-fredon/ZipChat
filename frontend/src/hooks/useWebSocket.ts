import { useCallback, useEffect } from 'react';
import { WebSocketMessage, WebSocketService } from '../services/websocket';

export const useWebSocket = (url: string) => {
	const ws = WebSocketService.getInstance();

	useEffect(() => {
		ws.connect(url);

		return () => {
			ws.disconnect();
		};
	}, [url, ws]);

	const sendMessage = useCallback(
		(message: WebSocketMessage) => {
			ws.send(message);
		},
		[ws]
	);

	const onMessage = useCallback(
		(callback: (message: WebSocketMessage) => void) => {
			ws.on('message', callback);
			return () => ws.off('message', callback);
		},
		[ws]
	);

	const onConnected = useCallback(
		(callback: () => void) => {
			ws.on('connected', callback);
			return () => ws.off('connected', callback);
		},
		[ws]
	);

	const onDisconnected = useCallback(
		(callback: () => void) => {
			ws.on('disconnected', callback);
			return () => ws.off('disconnected', callback);
		},
		[ws]
	);

	const onError = useCallback(
		(callback: (error: Error) => void) => {
			ws.on('error', callback);
			return () => ws.off('error', callback);
		},
		[ws]
	);

	return {
		sendMessage,
		onMessage,
		onConnected,
		onDisconnected,
		onError,
	};
};
