import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'

export function createSigners(privateKeys, provider) {
  return privateKeys.map((privateKey) => new ethers.Wallet(privateKey, provider))
}

export function createEthersAdapter(signer) {
  return new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })
}
