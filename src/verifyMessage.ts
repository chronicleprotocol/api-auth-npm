import { ecrecover, pubToAddress } from "@ethereumjs/util";
import {
	Address,
	bytesToHex,
	getAddress,
	hashMessage,
	Hex,
	hexToBytes,
	parseSignature,
} from "viem";

// had to made this sync version of viem's verifyMessage, which is unnecessarily async
export default function verifyMessage({
	address,
	message,
	signature,
}: {
	address: Address;
	message: string | { raw: Hex };
	signature: Hex;
}) {
	const { r, s, v } = parseSignature(signature);
	const hashedMessage = hashMessage(message);

	const publicKey = ecrecover(
		hexToBytes(hashedMessage),
		v!,
		hexToBytes(r),
		hexToBytes(s),
	);

	const recoveredAddress = getAddress(bytesToHex(pubToAddress(publicKey)));

	return recoveredAddress === getAddress(address);
}
