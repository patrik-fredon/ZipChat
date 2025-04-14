import { useCallback, useEffect, useState } from 'react';
import { WebSocketService } from '../services/websocket';

export function useTypingIndicator(senderId: string, recipientId: string) {
	const [isTyping, setIsTyping] = useState(false);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();

	const handleTyping = useCallback(
		(typing: boolean) => {
			if (typing) {
				setIsTyping(true);
				WebSocketService.notifyTyping(senderId, recipientId, true);

				if (typingTimeout) {
					clearTimeout(typingTimeout);
				}

				const timeout = setTimeout(() => {
					setIsTyping(false);
					WebSocketService.notifyTyping(senderId, recipientId, false);
				}, 3000);

				setTypingTimeout(timeout);
			} else {
				setIsTyping(false);
				WebSocketService.notifyTyping(senderId, recipientId, false);

				if (typingTimeout) {
					clearTimeout(typingTimeout);
				}
			}
		},
		[senderId, recipientId, typingTimeout]
	);

	useEffect(() => {
		return () => {
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
		};
	}, [typingTimeout]);

	return { isTyping, handleTyping };
}
