export const getBalanceScripts = {
	flow: `import FungibleToken from 0x9a0766d93b6608b7

                pub fun main(address: Address): UFix64 {
                    let account = getAccount(address)
                    let vault = account.getCapability<&AnyResource{FungibleToken.Balance}>(/public/flowTokenBalance).borrow()
                    ?? panic("Could not borrow vault ref")
                    return vault.balance
                }`,
	fusd: `import FungibleToken from 0xf233dcee88fe0abe
import FUSD from 0x3c5959b568896393

pub fun main(address: Address): UFix64 {
  let account = getAccount(address)

  let vaultRef = account
    .getCapability(/public/fusdBalance)
    .borrow<&FUSD.Vault{FungibleToken.Balance}>()
    ?? panic("Could not borrow Balance capability")

  return vaultRef.balance
}`,
}
