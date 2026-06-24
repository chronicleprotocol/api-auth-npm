import { type Hex } from "viem";
export declare function normalizeUsername(username: string): string;
export declare function deriveKeyFromCredentials(username: string, password: string): Hex;
export declare const AuthTokenErrorCode: {
    readonly MISSING_FIELDS: "MISSING_FIELDS";
    readonly INVALID_DURATION: "INVALID_DURATION";
    readonly DURATION_EXCEEDS_MAX: "DURATION_EXCEEDS_MAX";
    readonly TOKEN_FAILED: "TOKEN_FAILED";
};
export type AuthTokenErrorCode = (typeof AuthTokenErrorCode)[keyof typeof AuthTokenErrorCode];
export declare class AuthTokenError extends Error {
    readonly error: true;
    readonly code: AuthTokenErrorCode;
    constructor(code: AuthTokenErrorCode, message: string);
    toJSON(): {
        error: true;
        code: AuthTokenErrorCode;
        message: string;
    };
}
