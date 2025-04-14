# Kryptografický Servis

## Architektura

### Komponenty

```
[Klient] -> [Frontend] -> [Kryptografický servis] -> [Backend]
```

## Implementace

### Základní šifrování

```python
# src/services/crypto/base.py
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, hmac
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

class CryptoService:
    def __init__(self):
        self.backend = default_backend()

    def generate_key(self, password: bytes, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=self.backend
        )
        return kdf.derive(password)

    def encrypt(self, data: bytes, key: bytes) -> tuple[bytes, bytes, bytes]:
        iv = os.urandom(12)
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv),
            backend=self.backend
        )
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(data) + encryptor.finalize()
        return ciphertext, iv, encryptor.tag

    def decrypt(self, ciphertext: bytes, key: bytes, iv: bytes, tag: bytes) -> bytes:
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv, tag),
            backend=self.backend
        )
        decryptor = cipher.decryptor()
        return decryptor.update(ciphertext) + decryptor.finalize()
```

### End-to-End Šifrování

```python
# src/services/crypto/e2e.py
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
import base64

class E2ECrypto:
    def generate_key_pair(self) -> tuple[bytes, bytes]:
        private_key = ec.generate_private_key(
            ec.SECP256R1(),
            default_backend()
        )
        public_key = private_key.public_key()

        private_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )

        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        return private_bytes, public_bytes

    def derive_shared_key(self, private_key: bytes, peer_public_key: bytes) -> bytes:
        private_key = serialization.load_pem_private_key(
            private_key,
            password=None,
            backend=default_backend()
        )

        peer_public_key = serialization.load_pem_public_key(
            peer_public_key,
            backend=default_backend()
        )

        shared_key = private_key.exchange(ec.ECDH(), peer_public_key)

        return HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=None,
            info=b'handshake data',
            backend=default_backend()
        ).derive(shared_key)
```

### Perfect Forward Secrecy

```python
# src/services/crypto/pfs.py
class PFSCrypto:
    def __init__(self):
        self.ephemeral_keys = {}

    def generate_ephemeral_key(self, session_id: str) -> bytes:
        private_key = ec.generate_private_key(
            ec.SECP256R1(),
            default_backend()
        )

        public_key = private_key.public_key()
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        self.ephemeral_keys[session_id] = private_key
        return public_bytes

    def derive_session_key(self, session_id: str, peer_public_key: bytes) -> bytes:
        private_key = self.ephemeral_keys.get(session_id)
        if not private_key:
            raise ValueError("Session not found")

        peer_public_key = serialization.load_pem_public_key(
            peer_public_key,
            backend=default_backend()
        )

        shared_key = private_key.exchange(ec.ECDH(), peer_public_key)

        return HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=None,
            info=b'session key',
            backend=default_backend()
        ).derive(shared_key)
```

## API Endpoints

### Flask Aplikace

```python
# src/api/crypto.py
from flask import Flask, request, jsonify
from .services.crypto import CryptoService, E2ECrypto, PFSCrypto

app = Flask(__name__)
crypto = CryptoService()
e2e = E2ECrypto()
pfs = PFSCrypto()

@app.route('/encrypt', methods=['POST'])
def encrypt():
    data = request.json
    key = base64.b64decode(data['key'])
    plaintext = base64.b64decode(data['data'])

    ciphertext, iv, tag = crypto.encrypt(plaintext, key)

    return jsonify({
        'ciphertext': base64.b64encode(ciphertext).decode(),
        'iv': base64.b64encode(iv).decode(),
        'tag': base64.b64encode(tag).decode()
    })

@app.route('/e2e/keypair', methods=['POST'])
def generate_key_pair():
    private_key, public_key = e2e.generate_key_pair()

    return jsonify({
        'private_key': base64.b64encode(private_key).decode(),
        'public_key': base64.b64encode(public_key).decode()
    })

@app.route('/pfs/session', methods=['POST'])
def create_session():
    data = request.json
    session_id = data['session_id']

    public_key = pfs.generate_ephemeral_key(session_id)

    return jsonify({
        'public_key': base64.b64encode(public_key).decode()
    })
```

## Bezpečnost

### Rate Limiting

```python
# src/middleware/rate_limit.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/encrypt')
@limiter.limit("10 per minute")
def encrypt():
    # ...
```

### Audit Logging

```python
# src/middleware/audit.py
import logging
from datetime import datetime

audit_logger = logging.getLogger('audit')
audit_logger.setLevel(logging.INFO)

class AuditMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        start_time = datetime.now()
        response = self.app(environ, start_response)
        duration = datetime.now() - start_time

        audit_logger.info(
            f"Request: {environ['REQUEST_METHOD']} {environ['PATH_INFO']} "
            f"Duration: {duration.total_seconds()}s"
        )

        return response
```

## Testování

### Unit testy

```python
# tests/crypto/test_encryption.py
import unittest
from src.services.crypto import CryptoService

class TestCryptoService(unittest.TestCase):
    def setUp(self):
        self.crypto = CryptoService()
        self.key = os.urandom(32)
        self.data = b"test message"

    def test_encrypt_decrypt(self):
        ciphertext, iv, tag = self.crypto.encrypt(self.data, self.key)
        plaintext = self.crypto.decrypt(ciphertext, self.key, iv, tag)

        self.assertEqual(plaintext, self.data)

    def test_invalid_key(self):
        ciphertext, iv, tag = self.crypto.encrypt(self.data, self.key)
        wrong_key = os.urandom(32)

        with self.assertRaises(Exception):
            self.crypto.decrypt(ciphertext, wrong_key, iv, tag)
```

### Penetrační testy

```python
# tests/security/test_crypto.py
import unittest
from src.services.crypto import E2ECrypto

class TestE2ECrypto(unittest.TestCase):
    def test_key_exchange(self):
        e2e = E2ECrypto()

        # Generate key pairs for two users
        alice_private, alice_public = e2e.generate_key_pair()
        bob_private, bob_public = e2e.generate_key_pair()

        # Derive shared keys
        alice_shared = e2e.derive_shared_key(alice_private, bob_public)
        bob_shared = e2e.derive_shared_key(bob_private, alice_public)

        # Shared keys should be identical
        self.assertEqual(alice_shared, bob_shared)
```

## Deployment

### Docker Konfigurace

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "src.api.crypto:app"]
```

### Gunicorn Konfigurace

```python
# gunicorn.conf.py
import multiprocessing

bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 2
timeout = 30
keepalive = 2
```
