import unittest
from src.services.crypto import PFSCrypto

class TestPFSCrypto(unittest.TestCase):
    def test_session_key_exchange(self):
        pfs = PFSCrypto()
        session_id = "test_session"
        
        # Generate ephemeral keys
        alice_public = pfs.generate_ephemeral_key(session_id)
        bob_public = pfs.generate_ephemeral_key(session_id)
        
        # Derive session keys
        alice_key = pfs.derive_session_key(session_id, bob_public)
        bob_key = pfs.derive_session_key(session_id, alice_public)
        
        # Session keys should be identical
        self.assertEqual(alice_key, bob_key)
    
    def test_invalid_session(self):
        pfs = PFSCrypto()
        with self.assertRaises(ValueError):
            pfs.derive_session_key("invalid_session", b"dummy_key") 