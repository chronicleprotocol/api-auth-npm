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
