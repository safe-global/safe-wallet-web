import { toWei } from '@/utils/formatters'
import { Interface } from '@ethersproject/abi'
import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { Errors, logError } from '../exceptions'

const encodeTokenTransferData = (to: string, value: string): string => {
  const erc20Abi = ['function transfer(address to, uint256 value)']
  const contractInterface = new Interface(erc20Abi)
  return contractInterface.encodeFunctionData('transfer', [to, value])
}

const encodeERC721TransferData = (from: string, to: string, tokenId: string): string => {
  const erc721Abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)']
  const contractInterface = new Interface(erc721Abi)
  return contractInterface.encodeFunctionData('safeTransferFrom', [from, to, tokenId])
}

export const createTokenTransferParams = (
  recipient: string,
  amount: string,
  decimals: number,
  tokenAddress: string,
): MetaTransactionData | null => {
  const isNativeToken = parseInt(tokenAddress, 16) === 0
  const value = toWei(amount, decimals).toString()

  let data = '0x'
  if (!isNativeToken) {
    try {
      data = encodeTokenTransferData(recipient, value)
    } catch (e) {
      logError(Errors._815, (e as Error).message)
      return null
    }
  }

  return isNativeToken
    ? {
        to: recipient,
        value,
        data,
      }
    : {
        to: tokenAddress,
        value: '0',
        data,
      }
}

export const createNftTransferParams = (
  from: string,
  to: string,
  tokenId: string,
  tokenAddress: string,
): MetaTransactionData | null => {
  let data = ''
  try {
    data = encodeERC721TransferData(from, to, tokenId)
  } catch (e) {
    logError(Errors._815, (e as Error).message)
    return null
  }
  return {
    to: tokenAddress,
    value: '0',
    data,
  }
}
