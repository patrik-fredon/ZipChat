import asyncio
import websockets
import json
import logging
from app import cipher_suite

# Nastavení logování
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

connected_clients = set()

async def handle_message(websocket):
    logger.info(f"Nové připojení od klienta: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            logger.info(f"Přijata zpráva: {message}")
            data = json.loads(message)
            if 'message' in data:
                # Zašifrování zprávy
                encrypted_message = cipher_suite.encrypt(data['message'].encode())
                
                # Broadcast zprávy všem připojeným klientům
                response = json.dumps({
                    'type': 'message',
                    'encrypted': encrypted_message.decode(),
                    'sender': data.get('sender', 'anonymous')
                })
                logger.info(f"Odesílám odpověď: {response}")
                websockets.broadcast(connected_clients, response)
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Klient odpojen: {websocket.remote_address}")
    except Exception as e:
        logger.error(f"Chyba při zpracování zprávy: {e}")
    finally:
        connected_clients.remove(websocket)

async def main():
    logger.info("Spouštím WebSocket server na localhost:8001")
    server = await websockets.serve(
        handle_message,
        "127.0.0.1",
        8001,
        ping_interval=None,  # Vypnutí ping/pong pro testy
        ping_timeout=None
    )
    logger.info("WebSocket server je připraven")
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server ukončen uživatelem")
    except Exception as e:
        logger.error(f"Chyba při spuštění serveru: {e}") 