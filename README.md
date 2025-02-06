# Getting Started

## Install the NPM module

```sh
npm install --save @chronicleprotocol/api-auth
```

## Usage

Generating authentication tokens:

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

> Your public signing address must be allow-listed on our servers before your tokens will be valid.

Using an auth token to fetch an API endpoint:

```js
// token is received from the server
fetch(
  "https://chroniclelabs.org/api/pairs",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
```
