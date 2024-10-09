import {
  TransactionInfoType,
  TransferDirection,
  TransactionTokenType,
  TransactionInfo,
  ConflictType,
  TransactionListItemType,
  TransactionStatus,
  DetailedExecutionInfoType,
  TransactionListItem,
  TransactionSummary,
} from '@safe-global/safe-gateway-typescript-sdk'
import { RichFragmentType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/human-description'

export const fakeToken = {
  address: '0x1111111111',
  decimals: 18,
  name: 'NevinhaToken',
  symbol: 'NEV',
  trusted: false,
}
export const mockERC20Transfer: TransactionInfo = {
  type: TransactionInfoType.TRANSFER,
  sender: {
    value: '0x000000',
    name: 'something',
  },
  recipient: {
    value: '0x0ab',
    name: 'something',
  },
  transferInfo: {
    type: TransactionTokenType.ERC20,
    tokenAddress: '0x000000',
    value: '100000',
    trusted: false,
    imitation: true,
  },
  direction: TransferDirection.INCOMING,
  humanDescription: 'a simple incoming transaction',
}
export const mockSwapTransfer: TransactionInfo = {
  type: TransactionInfoType.SWAP_TRANSFER,
  sender: {
    value: '0x000000',
    name: 'something',
  },
  direction: TransferDirection.INCOMING,
  recipient: {
    value: '0x0ab',
    name: 'something',
  },
  transferInfo: {
    type: TransactionTokenType.ERC20,
    tokenAddress: '0x000000',
    value: '100000',
    trusted: false,
    imitation: true,
  },
  uid: '231',
  humanDescription: 'here a human description',
  richDecodedInfo: {
    fragments: [
      {
        type: RichFragmentType.Address,
        value: '0x0000',
      },
    ],
  },
  status: 'fulfilled',
  kind: 'buy',
  orderClass: 'limit',
  validUntil: 11902381293,
  sellAmount: '100',
  buyAmount: '1000000',
  executedSellAmount: '100',
  executedBuyAmount: '1000000',
  sellToken: fakeToken,
  buyToken: fakeToken,
  explorerUrl: 'http://google.com',
  executedSurplusFee: '',
  receiver: '0xbob',
  owner: '0xalice',
}

interface mockTransferWithInfoArgs {
  type?: TransactionInfoType
  direction?: TransferDirection
  methodName?: string
  actionCount?: number
  isCancellation?: boolean
}

export const mockTransferWithInfo = ({
  type = TransactionInfoType.TRANSFER,
  direction = TransferDirection.INCOMING,
  methodName,
  actionCount,
  isCancellation,
}: mockTransferWithInfoArgs): TransactionInfo =>
  ({
    type,
    sender: {
      value: '0x000000',
      name: 'something',
    },
    methodName,
    actionCount,
    recipient: {
      value: '0x0ab',
      name: 'something',
    },
    transferInfo: {
      type: TransactionTokenType.ERC20,
      tokenAddress: '0x000000',
      value: '100000',
      trusted: false,
      imitation: true,
    },
    dataDecoded: {
      method: 'mockMethod',
    },
    isCancellation,
    direction,
    humanDescription: 'a simple incoming transaction',
  }) as TransactionInfo

export const mockTransactionSummary: TransactionSummary = {
  id: 'id',
  timestamp: 123123,
  txStatus: TransactionStatus.SUCCESS,
  txInfo: mockTransferWithInfo({ type: TransactionInfoType.TRANSFER }),
  txHash: '0x0000000',
  executionInfo: {
    type: DetailedExecutionInfoType.MODULE,
    address: {
      value: '0x000000',
      name: 'something',
    },
  },
}

export const mockListItemByType = (type: TransactionListItemType): TransactionListItem =>
  ({
    transaction: mockTransactionSummary,
    conflictType: ConflictType.END,
    type,
  }) as TransactionListItem
