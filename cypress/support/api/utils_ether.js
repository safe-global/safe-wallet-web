import { ethers } from 'ethers'

export function createSigners(privateKeys, provider) {
  return privateKeys.map((privateKey) => new ethers.Wallet(privateKey, provider))
}
