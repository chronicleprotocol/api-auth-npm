import { type Hex } from "viem";
import { AuthTokenMessage } from "./types.js";
export declare function ensure0xPrefix(str: Hex | string): Hex;
export declare function strip0xPrefix(str: Hex | string): string;
export declare function authTokenMessageToBytes(message: AuthTokenMessage): Uint8Array<ArrayBuffer>;
export declare function authTokenBytesToMessage(bytes: Uint8Array): AuthTokenMessage;
