import { JsonFragment } from '@ethersproject/abi'

export const erc20Transfer: JsonFragment = {
  name: 'transfer',
  type: 'function',
  payable: false,
  stateMutability: 'nonpayable',
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
