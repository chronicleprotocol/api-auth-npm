import { Hex } from "viem";
import { describe, expect, test } from "vitest";
import {
	AuthTokenCode,
	parseAuthToken,
	signAuthToken,
	verifyAuthToken,
} from "../index";

describe("authentication tokens", () => {
	test("signAuthToken accepts a 32-byte 0x-prefixed hex string as a private key", async () => {
		const { token, message } = await signAuthToken({
			privateKey:
				"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
		});

		expect(message).toHaveProperty("description", "Chronicle API token");
		expect(message).toHaveProperty("version", 1);
		expect(message).toHaveProperty("validFrom");
		expect(message).toHaveProperty("validTo");
		expect(message).toHaveProperty(
			"signer",
			"0xFCAd0B19bB29D4674531d6f115237E16AfCE377c",
		);
		expect(message).toHaveProperty("nonce");

		expect(message.validFrom).toBeTypeOf("number");
		expect(message.validFrom).toBeLessThanOrEqual(
			Math.floor(Date.now() / 1000),
		);
		expect(message.validTo).toBeTypeOf("number");
		expect(message.validTo).toBeGreaterThan(message.validFrom);
		expect(message.nonce).toBeGreaterThanOrEqual(0);
		expect(message.nonce).toBeLessThanOrEqual(0xffffff);
		expect(token).toBeTypeOf("string");
		expect(token).toHaveLength(258);
	});

	test("signAuthToken fails when given a duration greater than max", async () => {
		await expect(
			signAuthToken({
				privateKey:
					"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
				duration: 1e9,
			}),
		).rejects.toThrow("Duration exceeds max");

		expect.assertions(1);
	});

	test("signAuthToken does not accept an invalid private key", async () => {
		await expect(
			signAuthToken({ privateKey: "0x12345" as Hex }),
		).rejects.toThrow(
			"invalid private key, expected hex or 32 bytes, got string",
		);

		expect.assertions(1);
	});

	test("verifyAuthToken reports an authentication token with a duration that exceeds maximum allowed", () => {
		const authToken =
			"8d598d2f46dabfb566c7048238413d79420823a37bddd96bc3c24a5d3e28ff367145fc90ebd5140613e427afe2ac0cde2b59fa4bd9cd387a3e766ccf5dbe91791b4368726f6e69636c652041504920746f6b656e00000000000000000000000000016733553a6dc1ccc4fcad0b19bb29d4674531d6f115237e16afce377c2d57be";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.DURATION_EXCEEDS_MAX);
	});

	test("verifyAuthToken reports an authentication token with an invalid version", () => {
		const authToken =
			"35f78febea5a116d77eb67b3f674c05157047eaf3fe6ab4b288dc44ed5aa7bc01f04a3c24f2c1bb73a352e9176144eb7e3a7e322990cbec0003ebf7503880fe61b4368726f6e69636c652041504920746f6b656e00000000000000000000000000006733565f67335669fcad0b19bb29d4674531d6f115237e16afce377c2138b6";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.INVALID_VERSION);
	});

	test("verifyAuthToken reports an expired authentication token", () => {
		const authToken =
			"a5bb59c2aef82cfcf1ed284fe520fcb73cdefa4cd63e2e2e16aca65706328e2a0f0ac6bca7b6b8e7de06aa879f39f2376dba014950371c5f652c341e2b57ff321b4368726f6e69636c652041504920746f6b656e0000000000000000000000000001673349d7673349e1fcad0b19bb29d4674531d6f115237e16afce377c1f551d";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.EXPIRED);
	});

	test("verifyAuthToken reports a not-yet-valid authentication token", () => {
		const authToken =
			"0b56ed8e0f2d47d62764db6e2779ae4c8753d4dd1e4ce8ab2dc1eb4c5571ecdd3e676025e793bdb866c0d85302652d19f5e94acf91fb4c43281de9e1ca45f71f1c4368726f6e69636c652041504920746f6b656e00000000000000000000000000016dc2f0596dc2f063fcad0b19bb29d4674531d6f115237e16afce377c176e12";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.NOT_YET_VALID);
	});

	test("verifyAuthToken reports an invalid signature authentication token", () => {
		const authToken =
			"000000c2aef82cfcf1ed284fe520fcb73cdefa4cd63e2e2e16aca65706328e2a0f0ac6bca7b6b8e7de06aa879f39f2376dba014950371c5f652c341e2b57ff321b4368726f6e69636c652041504920746f6b656e0000000000000000000000000001673349d7673349e1fcad0b19bb29d4674531d6f115237e16afce377c1f551d";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.INVALID_SIGNATURE);
	});

	test("verifyAuthToken reports a malformed authentication token (invalid description)", () => {
		const authToken =
			"6411237a560b071f07bc97f1c27918a439143ec2c2f0d9848ad2204196ed2a47045aa3258a3ad6cbebf4883b63036aca906ba039fc727aac4477ee386981fa0b1c4576696c20746f6b656e206465736372697074696f6e000000000000000000000167336a8667336a90fcad0b19bb29d4674531d6f115237e16afce377c605078";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.MALFORMED_TOKEN);
	});

	test("verifyAuthToken reports a malformed authentication token (validFrom is later than validTo)", () => {
		const authToken =
			"ce501f3893d8f757a9bc9940067393d54b4bc077290fd2ea2cb7b891a8c1e8e25542d0f5e049be43b97bb3dd873134a27fdab9db7723448ec13fe06e7e9ffa101c4368726f6e69636c652041504920746f6b656e00000000000000000000000000016743bb606734792afcad0b19bb29d4674531d6f115237e16afce377c1ff25a";
		const { isValid, code } = verifyAuthToken(authToken);

		expect(isValid).toBe(false);
		expect(code).toBe(AuthTokenCode.MALFORMED_TOKEN);
	});

	test("parseAuthToken properly parses an auth token", () => {
		const authToken =
			"868ba742ab1ca3b443b8e2b223b056136b7d109c7f38ecf78cd09425811f3a763d29443856d29bf60ee6ed85b852dd0aa8b774fef33ae20ebee62266767ab1421b4368726f6e69636c652041504920746f6b656e000000000000000000000000000167347a7467347a7efcad0b19bb29d4674531d6f115237e16afce377c19c016";

		const parsedToken = parseAuthToken(authToken);

		expect(parsedToken).toHaveProperty("description", "Chronicle API token");
		expect(parsedToken).toHaveProperty("version", 1);
		expect(parsedToken).toHaveProperty("validFrom", 1731492468);
		expect(parsedToken).toHaveProperty("validTo", 1731492478);
		expect(parsedToken).toHaveProperty(
			"signer",
			"0xFCAd0B19bB29D4674531d6f115237E16AfCE377c",
		);
		expect(parsedToken).toHaveProperty("nonce", 1687574);
	});

	test("parseAuthToken properly throws an Error on invalid auth token", () => {
		const authToken = "0xfeeddeadbeefdecafc0ffee";

		expect(() => parseAuthToken(authToken)).toThrow();
	});

	test("signAuthToken, verifyAuthToken, and parseAuthToken all work together properly", async () => {
		const privateKey =
			"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
		const { token, message } = await signAuthToken({ privateKey });
		const { isValid, code } = verifyAuthToken(token);
		const parsedToken = parseAuthToken(token);

		expect(isValid).toBe(true);
		expect(code).toBe(AuthTokenCode.VALID);
		expect(parsedToken).toEqual(message);
	});
});
