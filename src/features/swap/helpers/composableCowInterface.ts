import { Interface } from 'ethers'

const abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract IConditionalOrder',
            name: 'handler',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'staticInput',
            type: 'bytes',
          },
        ],
        internalType: 'struct IConditionalOrder.ConditionalOrderParams',
        name: 'params',
        type: 'tuple',
      },
      {
        internalType: 'contract IValueFactory',
        name: 'factory',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        internalType: 'bool',
        name: 'dispatch',
        type: 'bool',
      },
    ],
    name: 'createWithContext',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'singleOrderHash',
        type: 'bytes32',
      },
    ],
    name: 'remove',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const ComposableCowInterface = new Interface(abi)
