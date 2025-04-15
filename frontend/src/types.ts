export interface Message {
  id: string;
  content: string;
  iv: string;
  key: string;
  timestamp: Date;
  sender: string;
  status: 'sending' | 'sent' | 'error';
}

export interface EncryptedMessage {
  content: string;
  iv: string;
  key: string;
} 