import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { toDecimals } from '@/utils/formatters'
import { Interface } from '@ethersproject/abi'

const encodeTokenTransferData = (to: string, value: string): string => {
  const erc20Transfer = ['function transfer(address to, uint256 value)']
  const contractInterface = new Interface(erc20Transfer)
  return contractInterface.encodeFunctionData('transfer', [to, value])
}

export const createTokenTransferParams = (
  recipient: string,
  amount: string,
  decimals: number,
  tokenAddress: string,
): MetaTransactionData => {
  const value = toDecimals(amount, decimals).toString()
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
