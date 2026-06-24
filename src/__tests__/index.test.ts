import { expect, test } from "vitest";
import * as mod from "../index";

test("exports", () => {
	expect(mod.signAuthToken).toBeTypeOf("function");
	expect(mod.signAuthTokenFromCredentials).toBeTypeOf("function");
	expect(mod.deriveKeyFromCredentials).toBeTypeOf("function");
	expect(mod.normalizeUsername).toBeTypeOf("function");
});
