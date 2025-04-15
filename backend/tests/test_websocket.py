import pytest
from flask import Flask
from flask_socketio import SocketIO, SocketIOTestClient
import json
import logging
from cryptography.fernet import Fernet
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, socketio, encrypt_message, decrypt_message

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@pytest.fixture
def socket_client():
    client = SocketIOTestClient(app, socketio)
    return client

def test_socket_connection(socket_client):
    try:
        # Test message
        test_message = {"type": "message", "content": "Hello WebSocket!"}
        
        # Send message
        socket_client.emit('message', test_message)
        
        # Get response
        received = socket_client.get_received()
        assert len(received) > 0
        
        # Check response format
        response = received[0]
        assert response['name'] == 'response'
        
        # Verify data
        data = response['args'][0]
        assert 'encrypted' in data
        
        # Decrypt and verify content
        decrypted = decrypt_message(data['encrypted'])
        decrypted_data = json.loads(decrypted)
        assert decrypted_data['content'] == test_message['content']
        
        logger.info("WebSocket test passed successfully")
        
    except Exception as e:
        logger.error(f"Test failed with error: {str(e)}")
        raise 