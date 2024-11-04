import { signTypedData } from '@/utils/web3'
import type { JsonRpcSigner } from 'ethers'

const getProposerDataV2 = (chainId: string, proposerAddress: string) => {
  const totp = Math.floor(Date.now() / 1000 / 3600)

  const domain = {
    name: 'Safe Transaction Service',
    version: '1.0',
    chainId,
  }

  const types = {
    Delegate: [
      { name: 'delegateAddress', type: 'address' },
      { name: 'totp', type: 'uint256' },
    ],
  }

  const message = {
    delegateAddress: proposerAddress,
    totp,
  }

  return {
    domain,
    types,
    message,
  }
}

export const signProposerTypedData = async (chainId: string, proposerAddress: string, signer: JsonRpcSigner) => {
  const typedData = getProposerDataV2(chainId, proposerAddress)
  return signTypedData(signer, typedData)
}

const getProposerDataV1 = (proposerAddress: string) => {
  const totp = Math.floor(Date.now() / 1000 / 3600)

  return `${proposerAddress}${totp}`
}

export const signProposerData = (proposerAddress: string, signer: JsonRpcSigner) => {
  const data = getProposerDataV1(proposerAddress)

  return signer.signMessage(data)
}
