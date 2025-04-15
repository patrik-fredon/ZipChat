import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MessageComposer } from '../../components/messages/MessageComposer';

describe('MessageComposer', () => {
  const mockOnSend = vi.fn();
  const mockOnTyping = vi.fn();
  const mockRecipientId = 'test-recipient';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    expect(screen.getByPlaceholderText('Napište zprávu...')).toBeInTheDocument();
    expect(screen.getByLabelText('Přidat přílohu')).toBeInTheDocument();
    expect(screen.getByLabelText('Přidat emoji')).toBeInTheDocument();
    expect(screen.getByLabelText('Odeslat')).toBeInTheDocument();
  });

  it('handles message sending', async () => {
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    const input = screen.getByPlaceholderText('Napište zprávu...');
    const sendButton = screen.getByLabelText('Odeslat');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith({
        content: 'Test message',
        attachments: [],
        expiresAt: null
      });
    });
  });

  it('handles file attachments', async () => {
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Přidat přílohu');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
  });

  it('handles emoji selection', async () => {
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    const emojiButton = screen.getByLabelText('Přidat emoji');
    fireEvent.click(emojiButton);

    await waitFor(() => {
      expect(screen.getByText('Vyberte emoji')).toBeInTheDocument();
    });

    const emoji = screen.getByText('😊');
    fireEvent.click(emoji);

    expect(screen.getByPlaceholderText('Napište zprávu...')).toHaveValue('😊');
  });

  it('handles typing indicator', async () => {
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    const input = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(mockOnTyping).toHaveBeenCalledWith(true);
    });
  });

  it('handles draft saving', async () => {
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    const input = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(input, { target: { value: 'Draft message' } });

    // Simulate component unmount
    const { unmount } = render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );
    unmount();

    // Re-render component
    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Napište zprávu...')).toHaveValue('Draft message');
    });
  });

  it('handles errors', async () => {
    const mockError = new Error('Test error');
    mockOnSend.mockRejectedValueOnce(mockError);

    render(
      <MessageComposer
        onSend={mockOnSend}
        onTyping={mockOnTyping}
        recipientId={mockRecipientId}
      />
    );

    const input = screen.getByPlaceholderText('Napište zprávu...');
    const sendButton = screen.getByLabelText('Odeslat');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Chyba při odesílání zprávy')).toBeInTheDocument();
    });
  });
}); 