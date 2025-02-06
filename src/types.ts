import { Address } from "viem";

export interface AuthTokenMessage {
	description: string;
	version: number;
	validFrom: number;
	validTo: number;
	signer: Address;
	nonce: number;
}
