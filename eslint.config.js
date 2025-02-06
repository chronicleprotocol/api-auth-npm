import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["src/**/*.ts"],
		ignores: ["lib/**/*.js", "node_modules", "coverage"],
		languageOptions: {
			ecmaVersion: 2020,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
			"no-control-regex": "off",
		},
	},
);
