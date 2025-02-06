import {
	bytesToHex,
	bytesToNumber,
	bytesToString,
	getAddress,
	numberToBytes,
	stringToBytes,
	type Hex,
} from "viem";
import { AUTH_TOKEN_SPEC } from "./constants.js";
import { AuthTokenMessage } from "./types.js";

export function ensure0xPrefix(str: Hex | string): Hex {
	return str.startsWith("0x") ? (str as Hex) : (("0x" + str) as Hex);
}

export function strip0xPrefix(str: Hex | string): string {
	return str.replace(/^0x/, "");
}

export function authTokenMessageToBytes(message: AuthTokenMessage) {
	return Uint8Array.from([
		...stringToBytes(message.description, {
			size: AUTH_TOKEN_SPEC.fieldSizes.description,
		}),
		...numberToBytes(message.version, {
			size: AUTH_TOKEN_SPEC.fieldSizes.version,
		}),
		...numberToBytes(message.validFrom, {
			size: AUTH_TOKEN_SPEC.fieldSizes.validFrom,
		}),
		...numberToBytes(message.validTo, {
			size: AUTH_TOKEN_SPEC.fieldSizes.validTo,
		}),
		...numberToBytes(BigInt(message.signer), {
			size: AUTH_TOKEN_SPEC.fieldSizes.signer,
		}),
		...numberToBytes(message.nonce, { size: AUTH_TOKEN_SPEC.fieldSizes.nonce }),
	]);
}

export function authTokenBytesToMessage(bytes: Uint8Array): AuthTokenMessage {
	let pointer = 0;

	return {
		description: bytesToString(
			bytes.slice(pointer, (pointer += AUTH_TOKEN_SPEC.fieldSizes.description)),
		).replace(/\x00+$/, ""),
		version: bytesToNumber(
			bytes.slice(pointer, (pointer += AUTH_TOKEN_SPEC.fieldSizes.version)),
		),
		validFrom: bytesToNumber(
			bytes.slice(pointer, (pointer += AUTH_TOKEN_SPEC.fieldSizes.validFrom)),
		),
		validTo: bytesToNumber(
			bytes.slice(pointer, (pointer += AUTH_TOKEN_SPEC.fieldSizes.validTo)),
		),
		signer: getAddress(
			bytesToHex(
				bytes.slice(pointer, (pointer += AUTH_TOKEN_SPEC.fieldSizes.signer)),
			),
		),
		nonce: bytesToNumber(
			bytes.slice(pointer, (pointer += AUTH_TOKEN_SPEC.fieldSizes.nonce)),
		),
	};
}
