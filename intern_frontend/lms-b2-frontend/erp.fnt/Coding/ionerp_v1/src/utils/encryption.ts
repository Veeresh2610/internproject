import CryptoJS from 'crypto-js';

// Ensure key and IV are hashed properly
const SECRET_KEY = 'ems@123';
const SECRET_IV = 'iv@123';

// Generate 32-byte key and 16-byte IV by hashing with SHA-256
const key = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256(SECRET_KEY).toString().slice(0, 32));
const iv = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256(SECRET_IV).toString().slice(0, 16));

// Encryption
export const encrypt = (data: string): string => {
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString(); // Returns Base64-encoded ciphertext
};

// Decryption
export const decrypt = (ciphertext: string): string => {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);  // Converts decrypted bytes to UTF-8 string
};