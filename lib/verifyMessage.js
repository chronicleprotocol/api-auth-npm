import { ecrecover, pubToAddress } from "@ethereumjs/util";
import { bytesToHex, getAddress, hashMessage, hexToBytes, parseSignature, } from "viem";
export default function verifyMessage({ address, message, signature, }) {
    const { r, s, v } = parseSignature(signature);
    const hashedMessage = hashMessage(message);
    const publicKey = ecrecover(hexToBytes(hashedMessage), v, hexToBytes(r), hexToBytes(s));
    const recoveredAddress = getAddress(bytesToHex(pubToAddress(publicKey)));
    return recoveredAddress === getAddress(address);
}
