export const AUTH_TOKEN_VERSION = 1;
export const AUTH_TOKEN_VERSIONS = Object.freeze({
	1: {
		description: "Chronicle API token",
		maxAge: 30 * 60, // 30 minutes
		// sizes of each data field in bytes
		fieldSizes: {
			description: 32,
			version: 1,
			validFrom: 4,
			validTo: 4,
			signer: 20,
			nonce: 3,
		},
	},
} as const);
export const AUTH_TOKEN_SPEC = AUTH_TOKEN_VERSIONS[AUTH_TOKEN_VERSION];

export enum AuthTokenCode {
	VALID = "VALID",
	EXPIRED = "EXPIRED",
	NOT_YET_VALID = "NOT_YET_VALID",
	DURATION_EXCEEDS_MAX = "DURATION_EXCEEDS_MAX",
	INVALID_SIGNATURE = "INVALID_SIGNATURE",
	INVALID_VERSION = "INVALID_VERSION",
	MALFORMED_TOKEN = "MALFORMED_TOKEN",
	SIGNER_NOT_AUTHORIZED = "SIGNER_NOT_AUTHORIZED",
	MISSING_TOKEN = "MISSING_TOKEN",
}

let baseUrl: string | null = null;

try {
	// browser-side override for development
	baseUrl = localStorage.getItem("CHRONICLE_BASE_URL");
} catch {
	// ignore
}

// server-side override for development
baseUrl =
	baseUrl || process?.env?.CHRONICLE_BASE_URL || "https://chroniclelabs.org";

export const CHRONICLE_BASE_URL = baseUrl;
