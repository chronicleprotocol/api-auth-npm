export const AUTH_TOKEN_VERSION = 1;
export const AUTH_TOKEN_VERSIONS = Object.freeze({
    1: {
        description: "Chronicle API token",
        maxAge: 30 * 60,
        fieldSizes: {
            description: 32,
            version: 1,
            validFrom: 4,
            validTo: 4,
            signer: 20,
            nonce: 3,
        },
    },
});
export const AUTH_TOKEN_SPEC = AUTH_TOKEN_VERSIONS[AUTH_TOKEN_VERSION];
export var AuthTokenCode;
(function (AuthTokenCode) {
    AuthTokenCode["VALID"] = "VALID";
    AuthTokenCode["EXPIRED"] = "EXPIRED";
    AuthTokenCode["NOT_YET_VALID"] = "NOT_YET_VALID";
    AuthTokenCode["DURATION_EXCEEDS_MAX"] = "DURATION_EXCEEDS_MAX";
    AuthTokenCode["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    AuthTokenCode["INVALID_VERSION"] = "INVALID_VERSION";
    AuthTokenCode["MALFORMED_TOKEN"] = "MALFORMED_TOKEN";
    AuthTokenCode["SIGNER_NOT_AUTHORIZED"] = "SIGNER_NOT_AUTHORIZED";
    AuthTokenCode["MISSING_TOKEN"] = "MISSING_TOKEN";
})(AuthTokenCode || (AuthTokenCode = {}));
let baseUrl = null;
try {
    baseUrl = localStorage.getItem("CHRONICLE_BASE_URL");
}
catch {
}
baseUrl =
    baseUrl || process?.env?.CHRONICLE_BASE_URL || "https://chroniclelabs.org";
export const CHRONICLE_BASE_URL = baseUrl;
