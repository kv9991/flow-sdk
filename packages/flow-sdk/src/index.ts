import type { Fcl } from "@rarible/fcl-types"
import { Royalty } from "@rarible/flow-sdk-scripts"
import { FlowTransaction } from "@rarible/fcl-types/src"
import { FlowMintResponse, mint as mintTemplate } from "./nft/mint"
import { burn as burnTemplate } from "./nft/burn"
import { transfer as transferTemplate } from "./nft/transfer"
import { sell as sellTemplate } from "./order/sell"
import { buy as buyTemplate } from "./order/buy"
import { cancelOrder as cancelOrderTmeplate } from "./order/cancel-order"
import { signUserMessage as signUserMessageTemplate } from "./signature/sign-user-message"
import { CONFIGS, Networks } from "./config"
import { AuthWithPrivateKey, Currency } from "./types"

export { TxResult } from "./common/transaction"
export { FlowMintResponse } from "./nft/mint"
export { FlowTransaction } from "@rarible/fcl-types"

export interface FlowNftSdk {
	/**
	 *
	 * @param collection
	 * @param metadata
	 * @param royalties
	 * @return token id
	 */
	mint(collection: string, metadata: string, royalties: Royalty[]): Promise<FlowMintResponse>

	/**
	 *
	 * @param collection
	 * @param tokenId
	 * @param to
	 */
	transfer(collection: string, tokenId: number, to: string): Promise<FlowTransaction>

	/**
	 *
	 * @param collection
	 * @param tokenId
	 */
	burn(collection: string, tokenId: number): Promise<FlowTransaction>
}

export interface FlowOrderSdk {
	/**
	 *
	 * @param collection
	 * @param sellItemId
	 * @param sellItemPrice
	 */
	sell(collection: string, currency: Currency, sellItemId: number, sellItemPrice: string): Promise<FlowTransaction>

	/**
	 *
	 * @param collection
	 * @param itemId
	 * @param owner
	 */
	buy(collection: string, currency: Currency, orderId: number, owner: string): Promise<FlowTransaction>

	/**
	 *
	 * @param collection
	 * @param orderId
	 */
	cancelOrder(collection: string, orderId: number): Promise<FlowTransaction>
}

export interface FlowSdk {
	nft: FlowNftSdk,
	order: FlowOrderSdk,

	signUserMessage(message: string): Promise<string>
}


// todo may be add config param for wallet discovery
/**
 *
 * @param fcl
 * @param network
 * @param auth  - optional, only for testing purposes
 */
export function createFlowSdk(fcl: Fcl, network: Networks, auth?: AuthWithPrivateKey): FlowSdk {
	//todo maybe only check config exist, and configuration must initialized  on client
	fcl.config()
		.put("accessNode.api", CONFIGS[network].accessNode)
		.put("challenge.handshake", CONFIGS[network].challengeHandshake)

	const mint = mintTemplate.bind(null, fcl, auth, network)
	const transfer = transferTemplate.bind(null, fcl, auth, network)
	const burn = burnTemplate.bind(null, fcl, auth, network)

	const sell = sellTemplate.bind(null, fcl, auth, network)
	const buy = buyTemplate.bind(null, fcl, auth, network)
	const cancelOrder = cancelOrderTmeplate.bind(null, fcl, auth, network)

	const signUserMessage = signUserMessageTemplate.bind(null, fcl)

	return {
		nft: {
			mint,
			burn,
			transfer,
		},
		order: {
			sell,
			buy,
			cancelOrder,
		},
		signUserMessage,
	}
}
