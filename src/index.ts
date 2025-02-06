import { bytesToHex, getAddress, Hex, hexToBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
	AUTH_TOKEN_SPEC,
	AUTH_TOKEN_VERSION,
	AuthTokenCode,
} from "./constants.js";
import verifyMessage from "./verifyMessage.js";

import type {
	AuthTokenMessage,
} from "./types.js";
import { authTokenBytesToMessage, authTokenMessageToBytes } from "./utils.js";

export { AuthTokenCode } from "./constants.js";
export type {
	AuthTokenMessage,
} from "./types.js";

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
