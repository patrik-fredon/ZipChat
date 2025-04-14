import nodemailer from 'nodemailer';
import { EmailService } from '../email.service';

jest.mock('nodemailer');

describe('EmailService', () => {
	let service: EmailService;
	let mockTransporter: jest.Mocked<nodemailer.Transporter>;

	beforeEach(() => {
		process.env.SMTP_HOST = 'smtp.example.com';
		process.env.SMTP_PORT = '587';
		process.env.SMTP_SECURE = 'false';
		process.env.SMTP_USER = 'user';
		process.env.SMTP_PASS = 'pass';
		process.env.SMTP_FROM = 'noreply@example.com';
		process.env.FRONTEND_URL = 'http://localhost:3000';

		mockTransporter = {
			sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
		} as any;

		(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
		service = new EmailService();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('sendEmail', () => {
		it('should send email successfully', async () => {
			const options = {
				to: 'test@example.com',
				subject: 'Test',
				text: 'Test message'
			};

			await service.sendEmail(options);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: 'noreply@example.com',
				...options
			});
		});

		it('should handle email sending error', async () => {
			const error = new Error('SMTP error');
			mockTransporter.sendMail.mockRejectedValueOnce(error);

			await expect(
				service.sendEmail({
					to: 'test@example.com',
					subject: 'Test',
					text: 'Test message'
				})
			).rejects.toThrow('SMTP error');
		});
	});

	describe('sendNotificationEmail', () => {
		it('should send notification email successfully', async () => {
			const notification = {
				title: 'Test Notification',
				content: 'This is a test notification'
			};

			await service.sendNotificationEmail('test@example.com', notification);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'test@example.com',
					subject: 'Nová notifikace',
					text: expect.stringContaining(notification.title),
					html: expect.stringContaining(notification.title)
				})
			);
		});
	});

	describe('sendVerificationEmail', () => {
		it('should send verification email successfully', async () => {
			const token = 'verification-token';

			await service.sendVerificationEmail('test@example.com', token);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'test@example.com',
					subject: 'Ověření emailové adresy',
					text: expect.stringContaining(token),
					html: expect.stringContaining(token)
				})
			);
		});
	});

	describe('sendPasswordResetEmail', () => {
		it('should send password reset email successfully', async () => {
			const token = 'reset-token';

			await service.sendPasswordResetEmail('test@example.com', token);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'test@example.com',
					subject: 'Obnovení hesla',
					text: expect.stringContaining(token),
					html: expect.stringContaining(token)
				})
			);
		});
	});
});
