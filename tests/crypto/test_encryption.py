import unittest
import os
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