import { expect, test } from "vitest";
import * as mod from "../index";

test("exports", () => {
	expect(mod.signAuthToken).toBeTypeOf("function");
});

