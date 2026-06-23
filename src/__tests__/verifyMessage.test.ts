import {
	Hex,
	verifyMessage as viemVerifyMessage,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, test } from "vitest";
import verifyMessage from "../verifyMessage.js";

const account = privateKeyToAccount(
	"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
);
const otherAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("verifyMessage", () => {
	test("verifies a string message from the correct signer", async () => {
		const message = "Chronicle API token";
		const signature = await account.signMessage({ message });

		expect(verifyMessage({ address: account.address, message, signature })).toBe(
			true,
		);
	});

	test("rejects a string message against the wrong address", async () => {
		const message = "Chronicle API token";
		const signature = await account.signMessage({ message });

		expect(
			verifyMessage({ address: otherAddress, message, signature }),
		).toBe(false);
	});

	test("verifies a raw-hash message (the auth-token path) from the correct signer", async () => {
		const raw = ("0x" + "ab".repeat(64)) as Hex;
		const signature = await account.signMessage({ message: { raw } });

		expect(
			verifyMessage({ address: account.address, message: { raw }, signature }),
		).toBe(true);
	});

	test("rejects a raw-hash message against the wrong address", async () => {
		const raw = ("0x" + "ab".repeat(64)) as Hex;
		const signature = await account.signMessage({ message: { raw } });

		expect(
			verifyMessage({ address: otherAddress, message: { raw }, signature }),
		).toBe(false);
	});

	test("rejects a tampered signature", async () => {
		const message = "Chronicle API token";
		const signature = await account.signMessage({ message });
		// flip the last byte of s (leave v intact) to produce a valid-length but wrong signature
		const tampered = (signature.slice(0, 128) +
			(signature[128] === "0" ? "1" : "0") +
			signature.slice(129)) as Hex;

		expect(
			verifyMessage({ address: account.address, message, signature: tampered }),
		).toBe(false);
	});

	test("matches viem's async verifyMessage across messages and addresses", async () => {
		const cases: Array<{ message: string | { raw: Hex } }> = [
			{ message: "" },
			{ message: "hello chronicle" },
			{ message: { raw: ("0x" + "12".repeat(32)) as Hex } },
		];

		for (const { message } of cases) {
			const signature = await account.signMessage({ message });

			for (const address of [account.address, otherAddress] as const) {
				const expected = await viemVerifyMessage({
					address,
					message,
					signature,
				});

				expect(verifyMessage({ address, message, signature })).toBe(expected);
			}
		}
	});
});
