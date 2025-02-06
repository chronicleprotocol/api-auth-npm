import { Hex } from "viem";
import { AuthTokenCode } from "./constants.js";
import type { AuthTokenMessage } from "./types.js";
export { AuthTokenCode } from "./constants.js";
export type { AuthTokenMessage, } from "./types.js";
export declare function signAuthToken({ privateKey, duration, }: {
    privateKey: Hex;
    duration?: number;
}): Promise<{
    token: string;
    message: AuthTokenMessage;
}>;
export declare function verifyAuthToken(authToken: string): {
    isValid: boolean;
    code: AuthTokenCode;
};
export declare function parseAuthToken(authToken: string): AuthTokenMessage;
