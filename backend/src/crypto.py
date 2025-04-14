from flask import Flask, request, jsonify
from .services.crypto import CryptoService, E2ECrypto, PFSCrypto
import base64

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