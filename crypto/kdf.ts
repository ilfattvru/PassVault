import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';

export type KdfParams = {
  memory: number;
  iterations: number;
  parallelism: number;
};

const hexToBytes = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

export const deriveKEK = async (
  password: string,
  salt: Uint8Array,
  params: KdfParams,
) => {
  const result = await argon2.hash({
    pass: password,
    salt,
    time: params.iterations,
    mem: params.memory,
    hashLen: 32,
    parallelism: params.parallelism,
    type: argon2.ArgonType.Argon2id,
  });

  if (result.hash instanceof Uint8Array) {
    return result.hash;
  }

  if (typeof result.hash === 'string') {
    return hexToBytes(result.hash);
  }

  return new Uint8Array(result.hash);
};
