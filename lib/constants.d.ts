export declare const AUTH_TOKEN_VERSION = 1;
export declare const AUTH_TOKEN_VERSIONS: Readonly<{
    readonly 1: {
        readonly description: "Chronicle API token";
        readonly maxAge: number;
        readonly fieldSizes: {
            readonly description: 32;
            readonly version: 1;
            readonly validFrom: 4;
            readonly validTo: 4;
            readonly signer: 20;
            readonly nonce: 3;
        };
    };
}>;
export declare const AUTH_TOKEN_SPEC: {
    readonly description: "Chronicle API token";
    readonly maxAge: number;
    readonly fieldSizes: {
        readonly description: 32;
        readonly version: 1;
        readonly validFrom: 4;
        readonly validTo: 4;
        readonly signer: 20;
        readonly nonce: 3;
    };
};
export declare enum AuthTokenCode {
    VALID = "VALID",
    EXPIRED = "EXPIRED",
    NOT_YET_VALID = "NOT_YET_VALID",
    DURATION_EXCEEDS_MAX = "DURATION_EXCEEDS_MAX",
    INVALID_SIGNATURE = "INVALID_SIGNATURE",
    INVALID_VERSION = "INVALID_VERSION",
    MALFORMED_TOKEN = "MALFORMED_TOKEN",
    SIGNER_NOT_AUTHORIZED = "SIGNER_NOT_AUTHORIZED",
    MISSING_TOKEN = "MISSING_TOKEN"
}
export declare const CHRONICLE_BASE_URL: string;
