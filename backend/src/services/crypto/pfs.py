from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

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