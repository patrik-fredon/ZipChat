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