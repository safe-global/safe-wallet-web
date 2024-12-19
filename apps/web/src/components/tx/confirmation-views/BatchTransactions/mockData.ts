import type { DraftBatchItem } from '@/store/batchSlice'

export const mockedDarftBatch = [
  {
    id: '6283sw7pzyk',
    timestamp: 1726820415651,
    txDetails: {
      safeAddress: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
      txId: 'multisig_0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6_0x876e728deafcc9ba46461cc63078a521f520b620b0a3c2e4b40a5f1f69358f6c',
      executedAt: null,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        humanDescription: null,
        sender: {
          value: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
          name: null,
          logoUri: null,
        },
        recipient: {
          value: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
          name: 'GnosisSafeProxy',
          logoUri: null,
        },
        direction: 'OUTGOING',
        transferInfo: {
          type: 'NATIVE_COIN',
          value: '1000000000000',
        },
      },
      txData: {
        hexData: null,
        dataDecoded: null,
        to: {
          value: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
          name: 'GnosisSafeProxy',
          logoUri: null,
        },
        value: '1000000000000',
        operation: 0,
        trustedDelegateCallTarget: null,
        addressInfoIndex: null,
      },
      txHash: null,
      detailedExecutionInfo: {
        type: 'MULTISIG',
        submittedAt: 1726820406700,
        nonce: 45,
        safeTxGas: '0',
        baseGas: '0',
        gasPrice: '0',
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: {
          value: '0x0000000000000000000000000000000000000000',
          name: null,
          logoUri: null,
        },
        safeTxHash: '0x876e728deafcc9ba46461cc63078a521f520b620b0a3c2e4b40a5f1f69358f6c',
        executor: null,
        signers: [
          {
            value: '0xDa5e9FA404881Ff36DDa97b41Da402dF6430EE6b',
            name: null,
            logoUri: null,
          },
          {
            value: '0xEe91F585eA6ABc2822FaD082a095B46939059a31',
            name: null,
            logoUri: null,
          },
          {
            value: '0x3819b800c67Be64029C1393c8b2e0d0d627dADE2',
            name: null,
            logoUri: null,
          },
          {
            value: '0xd8BBcB76BC9AeA78972ED4773A5EB67B413f26A5',
            name: null,
            logoUri: null,
          },
          {
            value: '0x21D62C6894741DE97944D7844ED44D7782C66ABC',
            name: null,
            logoUri: null,
          },
          {
            value: '0xD33dD066fC8a0BC70269AC06B0ED98B00BFA3A0a',
            name: null,
            logoUri: null,
          },
          {
            value: '0xC2e333cb4aFfD6067D1d46ff80A6e631EC7B5A17',
            name: null,
            logoUri: null,
          },
          {
            value: '0xbc2BB26a6d821e69A38016f3858561a1D80d4182',
            name: null,
            logoUri: null,
          },
          {
            value: '0x474e5Ded6b5D078163BFB8F6dBa355C3aA5478C8',
            name: null,
            logoUri: null,
          },
        ],
        confirmationsRequired: 2,
        confirmations: [],
        rejectors: [],
        gasTokenInfo: null,
        trusted: false,
        proposer: {
          value: '0xDa5e9FA404881Ff36DDa97b41Da402dF6430EE6b',
          name: null,
          logoUri: null,
        },
      },
      safeAppInfo: null,
    },
  },
] as unknown as DraftBatchItem[]
