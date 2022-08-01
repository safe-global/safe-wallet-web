import { toWei } from '@/utils/formatters'
import { Interface } from '@ethersproject/abi'
import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'

const encodeTokenTransferData = (to: string, value: string): string => {
  const erc20Transfer = ['function transfer(address to, uint256 value)']
  const contractInterface = new Interface(erc20Transfer)
  return contractInterface.encodeFunctionData('transfer', [to, value])
}

const encodeERC721TransferData = (from: string, to: string, tokenId: string): string => {
  const erc721Transfer = ['function safeTransferFrom(address from, address to, uint256 tokenId)']
  const contractInterface = new Interface(erc721Transfer)
  return contractInterface.encodeFunctionData('safeTransferFrom', [from, to, tokenId])
}

export const createTokenTransferParams = (
  recipient: string,
  amount: string,
  decimals: number,
  tokenAddress: string,
): MetaTransactionData => {
  const value = toWei(amount, decimals).toString()
  const isNativeToken = parseInt(tokenAddress, 16) === 0

  return isNativeToken
    ? {
        to: recipient,
        value,
        data: '0x',
      }
    : {
        to: tokenAddress,
        value: '0',
        data: encodeTokenTransferData(recipient, value),
      }
}

export const createNftTransferParams = (
  from: string,
  to: string,
  tokenId: string,
  tokenAddress: string,
): MetaTransactionData => {
  return {
    to: tokenAddress,
    value: '0',
    data: encodeERC721TransferData(from, to, tokenId),
  }
}
