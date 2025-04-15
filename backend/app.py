from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from cryptography.fernet import Fernet
import os
import time
from prometheus_client import Counter, Histogram

app = Flask(__name__)
CORS(app)

# V produkci nastavit force_https=True
Talisman(
    app,
    force_https=False,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data:",
        'connect-src': "'self' ws://localhost:8000"
    }
)

socketio = SocketIO(app, cors_allowed_origins="*")
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Metriky
messages_sent = Counter('messages_sent_total', 'Total number of messages sent')
message_processing_time = Histogram('message_processing_seconds', 'Time spent processing messages')

# Generování klíče pro šifrování
key = Fernet.generate_key()
cipher_suite = Fernet(key)

@app.route('/api/encrypt', methods=['POST'])
@limiter.limit("100 per minute")
def encrypt_message():
    start_time = time.time()
    data = request.json
    message = data.get('message')
    encrypted_message = cipher_suite.encrypt(message.encode())
    message_processing_time.observe(time.time() - start_time)
    messages_sent.inc()
    return jsonify({'encrypted': encrypted_message.decode()})

@app.route('/api/decrypt', methods=['POST'])
@limiter.limit("100 per minute")
def decrypt_message():
    data = request.json
    encrypted_message = data.get('encrypted')
    decrypted_message = cipher_suite.decrypt(encrypted_message.encode())
    return jsonify({'decrypted': decrypted_message.decode()})

@socketio.on('message')
def handle_message(data):
    try:
        # Zašifrování zprávy
        encrypted_message = cipher_suite.encrypt(data['message'].encode())
        
        # Broadcast zprávy všem připojeným klientům
        socketio.emit('message', {
            'type': 'message',
            'encrypted': encrypted_message.decode(),
            'sender': data.get('sender', 'anonymous')
        })
    except Exception as e:
        socketio.emit('error', {'message': str(e)})

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000) 