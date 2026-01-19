const AES_GCM_IV_LENGTH = 12;

const importAesKey = (keyBytes: Uint8Array) => {
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
};

export const encryptBytes = async (plaintext: Uint8Array, keyBytes: Uint8Array) => {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const key = await importAesKey(keyBytes);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { cipherBytes: new Uint8Array(cipherBuffer), iv };
};

export const decryptBytes = async (
  cipherBytes: Uint8Array,
  iv: Uint8Array,
  keyBytes: Uint8Array,
) => {
  const key = await importAesKey(keyBytes);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
  return new Uint8Array(plainBuffer);
};

export const encryptString = async (plaintext: string, keyBytes: Uint8Array) => {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  return encryptBytes(plaintextBytes, keyBytes);
};

export const decryptString = async (
  cipherBytes: Uint8Array,
  iv: Uint8Array,
  keyBytes: Uint8Array,
) => {
  const decrypted = await decryptBytes(cipherBytes, iv, keyBytes);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
