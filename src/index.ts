import { bytesToHex, getAddress, Hex, hexToBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
	AUTH_TOKEN_SPEC,
	AUTH_TOKEN_VERSION,
	AuthTokenCode,
} from "./constants.js";
import {
	AuthTokenError,
	AuthTokenErrorCode,
	deriveKeyFromCredentials,
} from "./credentials.js";
import verifyMessage from "./verifyMessage.js";

import type { AuthTokenMessage } from "./types.js";
import { authTokenBytesToMessage, authTokenMessageToBytes } from "./utils.js";

export { AuthTokenCode } from "./constants.js";
export {
	AuthTokenError,
	AuthTokenErrorCode,
	deriveKeyFromCredentials,
	normalizeUsername,
} from "./credentials.js";
export type { AuthTokenMessage } from "./types.js";

export async function signAuthToken({
	privateKey,
	duration = AUTH_TOKEN_SPEC.maxAge,
}: {
	privateKey: Hex;
	duration?: number;
}): Promise<{ token: string; message: AuthTokenMessage }> {
	if (duration > AUTH_TOKEN_SPEC.maxAge) {
		throw new Error(
			`Duration exceeds max of ${AUTH_TOKEN_SPEC.maxAge} seconds`,
		);
	}

	const account = privateKeyToAccount(privateKey);
	const validFrom = Math.floor(Date.now() / 1000);
	const validTo = validFrom + duration;
	const nonce = parseInt((Math.random() * 1e16).toString(16).slice(0, 6), 16); // 3 byte random nonce

	const message = {
		description: "Chronicle API token",
		version: AUTH_TOKEN_VERSION,
		validFrom,
		validTo,
		signer: getAddress(account.address),
		nonce,
	};

	const rawMessage = authTokenMessageToBytes(message);

	const signature = await account.signMessage({
		message: { raw: rawMessage },
	});

	const signatureAndMessage =
		signature.replace(/^0x/, "") + bytesToHex(rawMessage).replace(/^0x/, "");

	return { token: signatureAndMessage, message };
}

/**
 * Sign an auth token using a username/password pair instead of an explicit
 * private key. The private key is derived deterministically from the
 * credentials via `deriveKeyFromCredentials`, so the same (username, password)
 * always maps to the same signer address.
 *
 * The runtime guards below are retained as defense-in-depth: callers may pass
 * untrusted/untyped data (e.g. an HTTP request body) despite the static types.
 * Validation failures throw `AuthTokenError` with a machine-readable `code`
 * (see `AuthTokenErrorCode`).
 */
export async function signAuthTokenFromCredentials({
	username,
	password,
	duration,
}: {
	username: string;
	password: string;
	duration?: number;
}): Promise<{ token: string; message: AuthTokenMessage }> {
	if (
		typeof username !== "string" ||
		typeof password !== "string" ||
		!username ||
		!password
	) {
		throw new AuthTokenError(
			AuthTokenErrorCode.MISSING_FIELDS,
			"Username and password are required",
		);
	}

	let validatedDuration: number | undefined;
	if (typeof duration !== "undefined") {
		// Reject NaN, Infinity, fractional, and non-positive values.
		// `signAuthToken` would otherwise accept NaN (NaN > maxAge is false) and
		// produce a token with `validTo = NaN`.
		if (
			typeof duration !== "number" ||
			!Number.isInteger(duration) ||
			duration <= 0
		) {
			throw new AuthTokenError(
				AuthTokenErrorCode.INVALID_DURATION,
				"Duration, if provided, must be a positive integer number of seconds",
			);
		}
		validatedDuration = duration;
	}

	const privateKey = deriveKeyFromCredentials(username, password);

	try {
		return await signAuthToken({ privateKey, duration: validatedDuration });
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Failed to generate auth token";
		const code = message.startsWith("Duration exceeds max")
			? AuthTokenErrorCode.DURATION_EXCEEDS_MAX
			: AuthTokenErrorCode.TOKEN_FAILED;
		throw new AuthTokenError(code, message);
	}
}

export function verifyAuthToken(authToken: string): {
	isValid: boolean;
	code: AuthTokenCode;
} {
	// signature is first: 64 char r, 64 char s, 2 char v
	const signature = ("0x" + authToken.slice(0, 130)) as Hex;
	const rawMessage = ("0x" + authToken.slice(130)) as Hex;
	const message = parseAuthToken(authToken);
	const epochNow = Math.floor(Date.now() / 1000);

	let code: AuthTokenCode = AuthTokenCode.VALID;

	const isValidSignature = verifyMessage({
		address: message.signer,
		message: {
			raw: rawMessage,
		},
		signature,
	});

	// tests are done in negation to make them easier to reason about
	if (!isValidSignature) {
		code = AuthTokenCode.INVALID_SIGNATURE;
	} else if (!(message.version === AUTH_TOKEN_VERSION)) {
		code = AuthTokenCode.INVALID_VERSION;
	} else if (
		!(
			message.description === AUTH_TOKEN_SPEC.description &&
			message.validFrom < message.validTo &&
			// nonce must be 3-byte unsigned integer
			message.nonce >= 0 &&
			message.nonce <= 0xffffff
		)
	) {
		code = AuthTokenCode.MALFORMED_TOKEN;
	} else if (!(epochNow >= message.validFrom)) {
		code = AuthTokenCode.NOT_YET_VALID;
	} else if (!(epochNow <= message.validTo)) {
		code = AuthTokenCode.EXPIRED;
	} else if (!(message.validTo - message.validFrom <= AUTH_TOKEN_SPEC.maxAge)) {
		code = AuthTokenCode.DURATION_EXCEEDS_MAX;
	}

	return { isValid: code === AuthTokenCode.VALID, code };
}

export function parseAuthToken(authToken: string): AuthTokenMessage {
	if (!authToken || typeof authToken !== "string" || authToken.length !== 258) {
		throw new Error(
			"Invalid auth token, must be 258 character hex string without 0x prefix",
		);
	}

	return authTokenBytesToMessage(
		hexToBytes(("0x" + authToken.slice(130)) as Hex),
	);
}
