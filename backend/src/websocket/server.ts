import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { verifyToken } from '../auth/jwt';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocketClient> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocketClient, req) => {
      // Přidání nového klienta
      this.clients.add(ws);
      ws.isAlive = true;

      // Autentizace klienta
      const token = req.headers['sec-websocket-protocol'];
      if (token) {
        try {
          const decoded = verifyToken(token);
          ws.userId = decoded.userId;
        } catch (error) {
          ws.close(1008, 'Unauthorized');
          return;
        }
      }

      // Ping/Pong pro udržení spojení
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Zpracování zpráv
      ws.on('message', async (data: string) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      // Uzavření spojení
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    // Pravidelné pingování klientů
    setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async handleMessage(ws: WebSocketClient, message: any) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    switch (message.type) {
      case 'chat':
        await this.handleChatMessage(ws, message);
        break;
      case 'typing':
        this.broadcastTyping(ws, message);
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  private async handleChatMessage(ws: WebSocketClient, message: any) {
    const { content, recipientId } = message;
    
    // Uložení zprávy do databáze
    const newMessage = await Message.create({
      senderId: ws.userId,
      recipientId,
      content,
      timestamp: new Date()
    });

    // Odeslání zprávy příjemci
    this.sendToUser(recipientId, {
      type: 'chat',
      message: newMessage
    });
  }

  private broadcastTyping(ws: WebSocketClient, message: any) {
    const { recipientId } = message;
    this.sendToUser(recipientId, {
      type: 'typing',
      userId: ws.userId
    });
  }

  private sendToUser(userId: string, data: any) {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        client.send(JSON.stringify(data));
      }
    });
  }
} 