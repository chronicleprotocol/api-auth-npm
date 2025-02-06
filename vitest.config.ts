import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "node",
		include: ["src/__tests__/**/*.test.ts"],
		coverage: {
			provider: "v8",
		},
	},
});
