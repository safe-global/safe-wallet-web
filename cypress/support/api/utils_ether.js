import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import Safe from '@safe-global/protocol-kit'

export function createSigners(privateKeys, provider) {
  return privateKeys.map((privateKey) => new ethers.Wallet(privateKey, provider))
}

export function createEthersAdapter(signer) {
  return new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })
}

export async function createSafes(safeConfigurations) {
  const safes = []
  for (const config of safeConfigurations) {
    const safe = await Safe.create({
      ethAdapter: config.ethAdapter,
      safeAddress: config.safeAddress,
    })
    safes.push(safe)
  }
  return safes
}
