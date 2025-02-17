import { Fcl } from "@rarible/fcl-types"
import { Networks } from "../config"
import { runTransaction, waitForSeal } from "../common/transaction"
import { getNftCode } from "../txCodeStore/ntf"
import { getCollectionConfig } from "../common/get-collection-config"
import { AuthWithPrivateKey, Royalty } from "../types"
import { FlowTransaction } from "../index"

export interface FlowMintResponse extends FlowTransaction {
	tokenId: number
}

export async function mint(
	fcl: Fcl, auth: AuthWithPrivateKey, network: Networks, collection: string, metadata: string, royalties: Royalty[],
): Promise<FlowMintResponse> {
	const { addressMap, collectionAddress, collectionConfig, collectionName } = getCollectionConfig(network, collection)
	if (collectionConfig.mintable) {
		const txId = await runTransaction(
			fcl, addressMap, getNftCode(collectionName).mint(fcl, collectionAddress, metadata, royalties), auth,
		)
		const txResult = await waitForSeal(fcl, txId)
		if (txResult.events.length) {
			const mintEvent = txResult.events.find(e => {
				const [_, __, ___, event] = e.type.split(".")
				return event === "Mint"
			})
			if (mintEvent) {
				return {
					tokenId: mintEvent.data.id,
					...txResult,
				}
			} else {
				throw Error("Mint event not found in transaction response")
			}
		} else {
			throw Error("Something went wrong, transaction sent but events is empty")
		}
	} else {
		throw Error("This collection doesn't support 'mint'")
	}
}
