import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { WebSocketService } from '../../services/websocket';
import { MessageComposer } from '../MessageComposer';

jest.mock('../../services/websocket', () => ({
  WebSocketService: {
    notifyTyping: jest.fn()
  }
}));

describe('MessageComposer', () => {
  const mockOnSendMessage = jest.fn();
  const mockCurrentUserId = 'user1';
  const mockRecipientId = 'user2';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    expect(screen.getByPlaceholderText('Napište zprávu...')).toBeInTheDocument();
    expect(screen.getByText('Odeslat')).toBeInTheDocument();
  });

  it('handles text input and typing indicator', async () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const textarea = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    expect(WebSocketService.notifyTyping).toHaveBeenCalledWith(mockCurrentUserId, mockRecipientId, true);

    await waitFor(() => {
      expect(WebSocketService.notifyTyping).toHaveBeenCalledWith(mockCurrentUserId, mockRecipientId, false);
    }, { timeout: 4000 });
  });

  it('saves draft to localStorage', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const textarea = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(textarea, { target: { value: 'Draft message' } });

    expect(localStorage.getItem(`message_draft_${mockRecipientId}`)).toBe(JSON.stringify('Draft message'));
  });

  it('loads draft from localStorage', () => {
    localStorage.setItem(`message_draft_${mockRecipientId}`, JSON.stringify('Saved draft'));

    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    expect(screen.getByPlaceholderText('Napište zprávu...')).toHaveValue('Saved draft');
  });

  it('handles file attachments', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('removes file attachments', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('×'));

    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('sends message with text and attachments', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const textarea = screen.getByPlaceholderText('Napište zprávu...');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Odeslat'));

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', [file]);
    expect(textarea).toHaveValue('');
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('disables send button when no content', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    expect(screen.getByText('Odeslat')).toBeDisabled();
  });

  it('enables send button with text content', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const textarea = screen.getByPlaceholderText('Napište zprávu...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    expect(screen.getByText('Odeslat')).not.toBeDisabled();
  });

  it('enables send button with attachments', () => {
    render(
      <MessageComposer
        currentUserId={mockCurrentUserId}
        recipientId={mockRecipientId}
        onSendMessage={mockOnSendMessage}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('Odeslat')).not.toBeDisabled();
  });
}); 