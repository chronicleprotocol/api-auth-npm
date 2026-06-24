import { concatHex, keccak256, toHex, type Hex } from "viem";

/**
 * Canonical form of a username before it is hashed or compared. Lowercases
 * and applies Unicode NFC normalisation so that NFC/NFD-equivalent inputs
 * (e.g. "café" as U+00E9 vs "café" as e + U+0301) map to the same derived
 * signer. Whitespace is intentionally NOT trimmed here: silently dropping
 * surrounding whitespace would let two different inputs map to the same
 * signer without the user knowing.
 */
export function normalizeUsername(username: string): string {
	return username.toLowerCase().normalize("NFC");
}

/**
 * Derive the deterministic private key the auth flow uses for a given
 * (username, password) pair. Username and password are hashed independently
 * so a collision between e.g. (`alice`, `bobpass`) and (`alicebob`, `pass`)
 * is impossible.
 *
 * Any change here changes the deterministic mapping from (username, password)
 * to a signer address. Two callers using different versions of this code will
 * disagree about which account a credential pair refers to.
 */
export function deriveKeyFromCredentials(
	username: string,
	password: string,
): Hex {
	const usernameHash = keccak256(
		toHex(`Chronicle API Auth username: ${normalizeUsername(username)}`),
	);
	const passwordHash = keccak256(
		toHex(`Chronicle API Auth password: ${password}`),
	);
	return keccak256(concatHex([usernameHash, passwordHash]));
}

export const AuthTokenErrorCode = {
	MISSING_FIELDS: "MISSING_FIELDS",
	INVALID_DURATION: "INVALID_DURATION",
	DURATION_EXCEEDS_MAX: "DURATION_EXCEEDS_MAX",
	TOKEN_FAILED: "TOKEN_FAILED",
} as const;

export type AuthTokenErrorCode =
	(typeof AuthTokenErrorCode)[keyof typeof AuthTokenErrorCode];

export class AuthTokenError extends Error {
	readonly error = true as const;
	readonly code: AuthTokenErrorCode;

	constructor(code: AuthTokenErrorCode, message: string) {
		super(message);
		this.name = "AuthTokenError";
		this.code = code;
	}

	toJSON() {
		return { error: this.error, code: this.code, message: this.message };
	}
}
