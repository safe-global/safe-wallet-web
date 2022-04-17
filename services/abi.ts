import { type AbiItem } from 'web3-utils'

export const erc20Transfer: AbiItem = {
  name: 'transfer',
  type: 'function',
  inputs: [
    {
      name: '_to',
      type: 'address',
    },
    {
      name: '_value',
      type: 'uint256',
    },
  ],
}
