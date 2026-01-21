import { decryptBytes, encryptBytes } from './aesgcm';

export const wrapDEK = async (dekBytes: Uint8Array, kekBytes: Uint8Array) => {
  return encryptBytes(dekBytes, kekBytes);
};

export const unwrapDEK = async (
  encryptedDekBytes: Uint8Array,
  iv: Uint8Array,
  kekBytes: Uint8Array,
) => {
  return decryptBytes(encryptedDekBytes, iv, kekBytes);
};
