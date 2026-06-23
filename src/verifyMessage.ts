import { secp256k1 } from "@noble/curves/secp256k1";
import { Address, getAddress, hashMessage, Hex, parseSignature } from "viem";
import { publicKeyToAddress } from "viem/accounts";

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
	const { r, s, v, yParity } = parseSignature(signature);
	const hashedMessage = hashMessage(message);

	const recovery = yParity ?? Number(v! - 27n);

	const recoveredSignature = secp256k1.Signature.fromCompact(
		r.slice(2) + s.slice(2),
	).addRecoveryBit(recovery);
	const publicKey = recoveredSignature
		.recoverPublicKey(hashedMessage.slice(2))
		.toHex(false);

	const recoveredAddress = publicKeyToAddress(`0x${publicKey}`);

	return recoveredAddress === getAddress(address);
}
