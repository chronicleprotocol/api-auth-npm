import { concatHex, keccak256, toHex } from "viem";
export function normalizeUsername(username) {
    return username.toLowerCase().normalize("NFC");
}
export function deriveKeyFromCredentials(username, password) {
    const usernameHash = keccak256(toHex(`Chronicle API Auth username: ${normalizeUsername(username)}`));
    const passwordHash = keccak256(toHex(`Chronicle API Auth password: ${password}`));
    return keccak256(concatHex([usernameHash, passwordHash]));
}
export const AuthTokenErrorCode = {
    MISSING_FIELDS: "MISSING_FIELDS",
    INVALID_DURATION: "INVALID_DURATION",
    DURATION_EXCEEDS_MAX: "DURATION_EXCEEDS_MAX",
    TOKEN_FAILED: "TOKEN_FAILED",
};
export class AuthTokenError extends Error {
    constructor(code, message) {
        super(message);
        this.error = true;
        this.name = "AuthTokenError";
        this.code = code;
    }
    toJSON() {
        return { error: this.error, code: this.code, message: this.message };
    }
}
