declare module 'argon2-browser' {
  export enum ArgonType {
    Argon2d = 0,
    Argon2i = 1,
    Argon2id = 2,
  }

  export type HashParams = {
    pass: string | Uint8Array;
    salt: Uint8Array;
    time: number;
    mem: number;
    hashLen: number;
    parallelism: number;
    type: ArgonType;
  };

  export type HashResult = {
    hash: Uint8Array | string;
    hashHex?: string;
    encoded?: string;
  };

  export function hash(params: HashParams): Promise<HashResult>;
}

declare module 'argon2-browser/dist/argon2-bundled.min.js' {
  import type { ArgonType, HashParams, HashResult } from 'argon2-browser';

  const argon2: {
    ArgonType: typeof ArgonType;
    hash: (params: HashParams) => Promise<HashResult>;
  };

  export default argon2;
}
