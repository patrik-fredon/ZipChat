export const encryptMessage = async (message: string): Promise<string> => {
  try {
    // Generate a random key
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Convert message to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Encrypt the message
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    // Convert encrypted data to base64
    const encryptedContent = btoa(
      String.fromCharCode(...new Uint8Array(encryptedData))
    );

    // Convert key to base64
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Convert IV to base64
    const ivBase64 = btoa(String.fromCharCode(...iv));

    // Return encrypted message with metadata
    return JSON.stringify({
      content: encryptedContent,
      iv: ivBase64,
      key: keyBase64,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptMessage = async (encryptedMessage: string): Promise<string> => {
  try {
    const { content, iv, key } = JSON.parse(encryptedMessage);

    // Convert base64 strings back to ArrayBuffer
    const encryptedData = Uint8Array.from(atob(content), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const keyArray = Uint8Array.from(atob(key), c => c.charCodeAt(0));

    // Import the key
    const importedKey = await window.crypto.subtle.importKey(
      'raw',
      keyArray,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['decrypt']
    );

    // Decrypt the message
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      importedKey,
      encryptedData
    );

    // Convert decrypted data to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}; 