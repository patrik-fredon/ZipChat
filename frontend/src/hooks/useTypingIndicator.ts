import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useTypingIndicator(recipientId: string) {
	const [isTyping, setIsTyping] = useState(false);
	const typingTimeoutRef = useRef<NodeJS.Timeout>();

	const handleTyping = useCallback(() => {
		setIsTyping(true);
		api.post('/messages/typing', { recipientId });

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			api.post('/messages/typing', { recipientId, isTyping: false });
		}, 3000);
	}, [recipientId]);

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	return { isTyping, handleTyping };
}
