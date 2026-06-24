import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, test } from "vitest";
import {
	AuthTokenCode,
	AuthTokenError,
	AuthTokenErrorCode,
	deriveKeyFromCredentials,
	normalizeUsername,
	signAuthTokenFromCredentials,
	verifyAuthToken,
} from "../index";

describe("username normalization", () => {
	test("lowercases the username", () => {
		expect(normalizeUsername("Alice")).toBe("alice");
	});

	test("applies Unicode NFC normalization", () => {
		// "caf\u00e9" as NFD ("e" + combining acute U+0301) normalizes to NFC (U+00E9)
		expect(normalizeUsername("cafe\u0301")).toBe("caf\u00e9");
	});

	test("does not trim whitespace", () => {
		expect(normalizeUsername(" alice ")).toBe(" alice ");
	});
});

describe("key derivation from credentials", () => {
	test("derives a deterministic 32-byte private key", () => {
		const key = deriveKeyFromCredentials("alice", "password123");

		expect(key).toMatch(/^0x[0-9a-f]{64}$/);
		expect(deriveKeyFromCredentials("alice", "password123")).toBe(key);
	});

	test("usernames differing only by case derive the same key", () => {
		expect(deriveKeyFromCredentials("Alice", "password123")).toBe(
			deriveKeyFromCredentials("alice", "password123"),
		);
	});

	test("passwords are case sensitive", () => {
		expect(deriveKeyFromCredentials("alice", "Password123")).not.toBe(
			deriveKeyFromCredentials("alice", "password123"),
		);
	});

	test("username/password boundary shifts derive different keys", () => {
		expect(deriveKeyFromCredentials("alice", "bobpass")).not.toBe(
			deriveKeyFromCredentials("alicebob", "pass"),
		);
	});
});

describe("signAuthTokenFromCredentials", () => {
	test("signs a verifiable token whose signer matches the derived key", async () => {
		const { token, message } = await signAuthTokenFromCredentials({
			username: "alice",
			password: "password123",
		});

		const { isValid, code } = verifyAuthToken(token);
		expect(isValid).toBe(true);
		expect(code).toBe(AuthTokenCode.VALID);

		const account = privateKeyToAccount(
			deriveKeyFromCredentials("alice", "password123"),
		);
		expect(message.signer).toBe(account.address);
	});

	test("accepts an explicit duration", async () => {
		const { message } = await signAuthTokenFromCredentials({
			username: "alice",
			password: "password123",
			duration: 60,
		});

		expect(message.validTo - message.validFrom).toBe(60);
	});

	test.each([
		["missing username", { password: "password123" }],
		["missing password", { username: "alice" }],
		["empty username", { username: "", password: "password123" }],
		["empty password", { username: "alice", password: "" }],
		["non-string username", { username: 1, password: "password123" }],
	])("rejects %s with MISSING_FIELDS", async (_label, credentials) => {
		await expect(
			signAuthTokenFromCredentials(credentials),
		).rejects.toMatchObject({
			name: "AuthTokenError",
			code: AuthTokenErrorCode.MISSING_FIELDS,
		});
	});

	test.each([
		["NaN", NaN],
		["Infinity", Infinity],
		["fractional", 1.5],
		["zero", 0],
		["negative", -60],
		["string", "60"],
	])("rejects %s duration with INVALID_DURATION", async (_label, duration) => {
		await expect(
			signAuthTokenFromCredentials({
				username: "alice",
				password: "password123",
				duration,
			}),
		).rejects.toMatchObject({
			name: "AuthTokenError",
			code: AuthTokenErrorCode.INVALID_DURATION,
		});
	});

	test("rejects a duration greater than max with DURATION_EXCEEDS_MAX", async () => {
		await expect(
			signAuthTokenFromCredentials({
				username: "alice",
				password: "password123",
				duration: 1e9,
			}),
		).rejects.toMatchObject({
			name: "AuthTokenError",
			code: AuthTokenErrorCode.DURATION_EXCEEDS_MAX,
		});
	});

	test("AuthTokenError serializes to a JSON API error shape", () => {
		const error = new AuthTokenError(
			AuthTokenErrorCode.TOKEN_FAILED,
			"something broke",
		);

		expect(error.toJSON()).toEqual({
			error: true,
			code: AuthTokenErrorCode.TOKEN_FAILED,
			message: "something broke",
		});
	});
});
