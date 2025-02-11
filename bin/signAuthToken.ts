#!/usr/bin/env npx tsx

import { Hex } from "viem";
import { signAuthToken } from "../src/index";

let privateKey = (process.argv[2] || "").replace("--privateKey=", "");

if (!privateKey) {
	console.error("Usage: signAuthToken --privateKey=<privateKey>");
	process.exit(1);
}

if (!privateKey.startsWith("0x")) {
	privateKey = "0x" + privateKey;
}

if (privateKey.length !== 66) {
	console.error(
		"Invalid private key. Must be a 32 byte (64 character) hex string, with or without leading 0x",
	);
	process.exit(1);
}

signAuthToken({ privateKey: privateKey as Hex }).then((result) => {
	console.log(result.token);
});
