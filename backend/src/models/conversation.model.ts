import { z } from 'zod';

export interface IConversation {
	id: string;
	name: string;
	participants: string[];
	createdAt: Date;
	updatedAt: Date;
}

export const conversationSchema = z.object({
	name: z.string().min(3).max(50),
	participants: z.array(z.string().uuid()).min(2)
});

export type ConversationInput = z.infer<typeof conversationSchema>;

export class Conversation implements IConversation {
	id: string;
	name: string;
	participants: string[];
	createdAt: Date;
	updatedAt: Date;

	constructor(data: ConversationInput) {
		this.id = crypto.randomUUID();
		this.name = data.name;
		this.participants = data.participants;
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	validate(): void {
		conversationSchema.parse({
			name: this.name,
			participants: this.participants
		});
	}

	addParticipant(userId: string): void {
		if (!this.participants.includes(userId)) {
			this.participants.push(userId);
			this.updatedAt = new Date();
		}
	}

	removeParticipant(userId: string): void {
		this.participants = this.participants.filter((id) => id !== userId);
		this.updatedAt = new Date();
	}

	updateName(name: string): void {
		this.name = name;
		this.updatedAt = new Date();
	}
}
