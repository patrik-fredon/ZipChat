import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MessageComposer } from '../../components/messages/MessageComposer';
import { api } from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../hooks/useTypingIndicator');
jest.mock('../../hooks/useLocalStorage');

describe('MessageComposer', () => {
  const mockOnMessageSent = jest.fn();
  const recipientId = 'recipient123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render message composer with all elements', () => {
    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    expect(screen.getByPlaceholderText('Napište zprávu...')).toBeInTheDocument();
    expect(screen.getByLabelText('Přidat emoji')).toBeInTheDocument();
    expect(screen.getByLabelText('Přidat přílohu')).toBeInTheDocument();
    expect(screen.getByLabelText('Odeslat zprávu')).toBeInTheDocument();
  });

  it('should handle message submission', async () => {
    const mockResponse = { id: 'msg123', content: 'Test message' };
    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    const input = screen.getByPlaceholderText('Napište zprávu...');
    const submitButton = screen.getByLabelText('Odeslat zprávu');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/messages', {
        recipientId,
        content: 'Test message'
      });
      expect(mockOnMessageSent).toHaveBeenCalledWith(mockResponse);
      expect(input).toHaveValue('');
    });
  });

  it('should handle file attachment', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const mockResponse = { id: 'msg123', content: 'Test message', attachments: [file] };
    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    const fileInput = screen.getByLabelText('Přidat přílohu');
    const submitButton = screen.getByLabelText('Odeslat zprávu');

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(FormData)
      );
      expect(mockOnMessageSent).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('should handle emoji selection', () => {
    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    const emojiButton = screen.getByLabelText('Přidat emoji');
    fireEvent.click(emojiButton);

    expect(screen.getByText('Vyberte emoji')).toBeInTheDocument();
  });

  it('should handle typing indicator', async () => {
    const mockHandleTyping = jest.fn();
    (useTypingIndicator as jest.Mock).mockReturnValue({
      handleTyping: mockHandleTyping
    });

    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    const input = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(mockHandleTyping).toHaveBeenCalledWith('Test');
    });
  });

  it('should handle draft saving', async () => {
    const mockSetDraft = jest.fn();
    (useLocalStorage as jest.Mock).mockReturnValue(['', mockSetDraft]);

    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    const input = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(input, { target: { value: 'Draft message' } });

    await waitFor(() => {
      expect(mockSetDraft).toHaveBeenCalledWith('Draft message');
    });
  });

  it('should handle error during message submission', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Failed to send message'));

    render(<MessageComposer recipientId={recipientId} onMessageSent={mockOnMessageSent} />);

    const input = screen.getByPlaceholderText('Napište zprávu...');
    const submitButton = screen.getByLabelText('Odeslat zprávu');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nepodařilo se odeslat zprávu')).toBeInTheDocument();
    });
  });
}); 