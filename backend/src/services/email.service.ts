import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

export class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: process.env.SMTP_SECURE === 'true',
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		});
	}

	async sendEmail(options: EmailOptions) {
		try {
			const mailOptions = {
				from: process.env.SMTP_FROM,
				...options
			};

			const info = await this.transporter.sendMail(mailOptions);
			logger.info(`Email odeslán: ${info.messageId}`);
			return info;
		} catch (error) {
			logger.error('Chyba při odesílání emailu:', error);
			throw error;
		}
	}

	async sendNotificationEmail(userEmail: string, notification: any) {
		try {
			const subject = 'Nová notifikace';
			const text = `Máte novou notifikaci: ${notification.title}\n\n${notification.content}`;
			const html = `
        <h1>Nová notifikace</h1>
        <h2>${notification.title}</h2>
        <p>${notification.content}</p>
        <p>Datum: ${new Date().toLocaleString('cs-CZ')}</p>
      `;

			await this.sendEmail({
				to: userEmail,
				subject,
				text,
				html
			});
		} catch (error) {
			logger.error('Chyba při odesílání notifikačního emailu:', error);
			throw error;
		}
	}

	async sendVerificationEmail(userEmail: string, token: string) {
		try {
			const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
			const subject = 'Ověření emailové adresy';
			const text = `Pro ověření vaší emailové adresy klikněte na následující odkaz: ${verificationUrl}`;
			const html = `
        <h1>Ověření emailové adresy</h1>
        <p>Pro ověření vaší emailové adresy klikněte na následující odkaz:</p>
        <a href="${verificationUrl}">Ověřit email</a>
      `;

			await this.sendEmail({
				to: userEmail,
				subject,
				text,
				html
			});
		} catch (error) {
			logger.error('Chyba při odesílání verifikačního emailu:', error);
			throw error;
		}
	}

	async sendPasswordResetEmail(userEmail: string, token: string) {
		try {
			const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
			const subject = 'Obnovení hesla';
			const text = `Pro obnovení vašeho hesla klikněte na následující odkaz: ${resetUrl}`;
			const html = `
        <h1>Obnovení hesla</h1>
        <p>Pro obnovení vašeho hesla klikněte na následující odkaz:</p>
        <a href="${resetUrl}">Obnovit heslo</a>
      `;

			await this.sendEmail({
				to: userEmail,
				subject,
				text,
				html
			});
		} catch (error) {
			logger.error('Chyba při odesílání emailu pro obnovení hesla:', error);
			throw error;
		}
	}
}
