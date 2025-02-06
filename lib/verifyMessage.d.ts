import { Address, Hex } from "viem";
export default function verifyMessage({ address, message, signature, }: {
    address: Address;
    message: string | {
        raw: Hex;
    };
    signature: Hex;
}): boolean;
