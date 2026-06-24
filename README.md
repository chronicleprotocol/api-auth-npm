# Getting Started

## Install the NPM module

```sh
npm install --save @chronicleprotocol/api-auth
```

## Usage

Generating authentication tokens programmatically:

```js
import { signAuthToken } from "@chronicleprotocol/api-auth";

const { token, message } = signAuthToken({
	// private key is 0x prefixed 32 byte hex string
	privateKey: "0xabc...",
});

// `token` is hex string to be included as Authorization header (see below)
// `message` is object containing decoded data within `token`. Optional,
// but can be useful for programmatic token handling
```

Generating authentication tokens from a username/password pair:

```js
import { signAuthTokenFromCredentials } from "@chronicleprotocol/api-auth";

// The private key is derived deterministically from the credentials, so the
// same (username, password) pair always maps to the same signer address.
// Usernames are case-insensitive (lowercased + Unicode NFC normalized);
// passwords are case-sensitive.
const { token, message } = await signAuthTokenFromCredentials({
	username: "myusername",
	password: "mypassword123",
	// duration: 1800, // optional, in seconds
});

// Validation failures throw an `AuthTokenError` with a machine-readable
// `code` (see `AuthTokenErrorCode`): MISSING_FIELDS, INVALID_DURATION,
// DURATION_EXCEEDS_MAX, or TOKEN_FAILED.
```

The lower-level helpers `deriveKeyFromCredentials(username, password)` and
`normalizeUsername(username)` are also exported, e.g. for computing the signer
address for a credential pair without signing a token.

To generate a token via the command line, use:

```bash
# Please do not put your private key directly in the command and have it show up in your shell history :-(
npx @chronicleprotocol/api-auth --privateKey=$PRIVATE_KEY
```

> NOTE: Your public signing address must be allow-listed on our servers before your tokens will be valid.

Using an auth token to fetch an API endpoint programmatically:

```js
fetch("https://chroniclelabs.org/api/authTest", {
	headers: {
		Authorization: `Bearer ${token}`,
	},
});
```

or via command line:

```bash
curl --header "Authorization: Bearer $AUTH_TOKEN" https://chroniclelabs.org/api/authTest
```
