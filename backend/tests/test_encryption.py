import pytest
from app import app, cipher_suite

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_encryption(client):
    response = client.post('/api/encrypt', json={'message': 'test'})
    assert response.status_code == 200
    assert 'encrypted' in response.json
    
    encrypted = response.json['encrypted']
    response = client.post('/api/decrypt', json={'encrypted': encrypted})
    assert response.status_code == 200
    assert response.json['decrypted'] == 'test'

def test_rate_limiting(client):
    for _ in range(101):
        response = client.post('/api/encrypt', json={'message': 'test'})
    assert response.status_code == 429 