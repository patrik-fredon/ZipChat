import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Chat } from '../../components/Chat';
import { useWebSocket } from '../../hooks/useWebSocket';

// Mock useWebSocket hook
vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn()
}));

describe('Chat', () => {
  const mockSendMessage = vi.fn();
  const mockSendTyping = vi.fn();
  let messageCallback: (data: any) => void;
  let typingCallback: (data: any) => void;
  let connectedCallback: () => void;
  let disconnectedCallback: () => void;
  let errorCallback: (error: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    messageCallback = vi.fn();
    typingCallback = vi.fn();
    connectedCallback = vi.fn();
    disconnectedCallback = vi.fn();
    errorCallback = vi.fn();

    (useWebSocket as any).mockReturnValue({
      sendMessage: mockSendMessage,
      sendTyping: mockSendTyping,
      onMessage: vi.fn((cb) => {
        messageCallback = cb;
        return () => { };
      }),
      onTyping: vi.fn((cb) => {
        typingCallback = cb;
        return () => { };
      }),
      onConnected: vi.fn((cb) => {
        connectedCallback = cb;
        return () => { };
      }),
      onDisconnected: vi.fn((cb) => {
        disconnectedCallback = cb;
        return () => { };
      }),
      onError: vi.fn((cb) => {
        errorCallback = cb;
        return () => { };
      })
    });
  });

  it('renders correctly', () => {
    render(<Chat />);
    expect(screen.getByPlaceholderText('Napište zprávu...')).toBeInTheDocument();
    expect(screen.getByText('Odeslat')).toBeInTheDocument();
    expect(screen.getByText('Odpojeno')).toBeInTheDocument();
  });

  it('handles message sending', async () => {
    render(<Chat />);
    connectedCallback(); // Simulate connection

    const input = screen.getByPlaceholderText('Napište zprávu...');
    const sendButton = screen.getByText('Odeslat');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello');
      expect(mockSendTyping).toHaveBeenCalledWith(false);
    });
  });

  it('handles typing status', async () => {
    render(<Chat />);
    connectedCallback(); // Simulate connection

    const input = screen.getByPlaceholderText('Napište zprávu...');

    fireEvent.change(input, { target: { value: 'H' } });

    await waitFor(() => {
      expect(mockSendTyping).toHaveBeenCalledWith(true);
    });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockSendTyping).toHaveBeenCalledWith(false);
    });
  });

  it('displays received messages', async () => {
    render(<Chat />);
    connectedCallback(); // Simulate connection

    messageCallback({
      userId: 'user1',
      content: 'Hello there'
    });

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('Hello there')).toBeInTheDocument();
    });
  });

  it('displays typing indicator', async () => {
    render(<Chat />);
    connectedCallback(); // Simulate connection

    typingCallback({
      userId: 'user1',
      isTyping: true
    });

    await waitFor(() => {
      expect(screen.getByText(/user1 píše/)).toBeInTheDocument();
    });
  });

  it('handles connection status', async () => {
    render(<Chat />);
    connectedCallback();

    await waitFor(() => {
      expect(screen.getByText('Připojeno')).toBeInTheDocument();
    });
  });

  it('handles disconnection status', async () => {
    render(<Chat />);
    disconnectedCallback();

    await waitFor(() => {
      expect(screen.getByText('Odpojeno')).toBeInTheDocument();
    });
  });

  it('handles errors', async () => {
    render(<Chat />);
    errorCallback(new Error('Connection error'));

    await waitFor(() => {
      expect(screen.getByText('Connection error')).toBeInTheDocument();
    });
  });

  it('disables input and button when disconnected', async () => {
    render(<Chat />);
    disconnectedCallback();

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Napište zprávu...');
      const button = screen.getByText('Odeslat');
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });
  });

  it('enables input and button when connected', async () => {
    render(<Chat />);
    connectedCallback();

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Napište zprávu...');
      const button = screen.getByText('Odeslat');
      expect(input).not.toBeDisabled();
      expect(button).not.toBeDisabled();
    });
  });
}); 