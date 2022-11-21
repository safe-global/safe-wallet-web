import type { Page } from '@gnosis.pm/safe-react-gateway-sdk'
import type { AddressEx } from '@gnosis.pm/safe-react-gateway-sdk'

// TODO: Export to gateway SDK
export enum MessageListItemType {
  DATE_LABEL = 'DATE_LABEL',
  MESSAGE = 'MESSAGE',
}

export enum MessageStatus {
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
}

export type MessageDateLabel = {
  type: MessageListItemType.DATE_LABEL
  timestamp: number
}

export type Message = {
  type: MessageListItemType.MESSAGE
  messageHash: string
  status: MessageStatus
  logoUri: string // Implementation may change
  name: string // Implementation may change
  message: string | Record<string, unknown>
  creationTimestamp: number
  modifiedTimestamp: number
  confirmationsSubmitted: number
  confirmationsRequired: number
  confirmations: {
    owner: AddressEx
    signature: string
  }[]
  proposedBy: AddressEx
  preparedSignature: string | null // Name subject to change
}

export type MessageListPage = Page<MessageDateLabel | Message>

const MOCK_DATA: (MessageDateLabel | Message)[] = [
  {
    type: MessageListItemType.DATE_LABEL,
    timestamp: Date.now(),
  },
  {
    type: MessageListItemType.MESSAGE,
    messageHash: '0x123',
    status: MessageStatus.NEEDS_CONFIRMATION,
    logoUri: '',
    name: 'Example dApp',
    message: 'Example string message',
    creationTimestamp: Date.now(),
    modifiedTimestamp: Date.now(),
    confirmationsSubmitted: 1,
    confirmationsRequired: 2,
    confirmations: [
      {
        owner: { value: '0x123', name: 'John' },
        signature: '0x123',
      },
    ],
    proposedBy: {
      value: '0x123',
      name: 'John',
    },
    preparedSignature: null,
  },
  {
    type: MessageListItemType.MESSAGE,
    messageHash: '0x456',
    status: MessageStatus.CONFIRMED,
    logoUri: '',
    name: 'Example dApp',
    message: {
      example: 'Typed data message',
    },
    creationTimestamp: Date.now(),
    modifiedTimestamp: Date.now(),
    confirmationsSubmitted: 1,
    confirmationsRequired: 1,
    confirmations: [
      {
        owner: { value: '0x123', name: 'Alice' },
        signature: '0x123',
      },
    ],
    proposedBy: {
      value: '0x123',
      name: 'Alice',
    },
    preparedSignature: '0x123',
  },
]

// TODO: Use store
const useMessages = (_pageUrl?: string) => {
  return {
    error: undefined,
    loading: false,
    page: {
      previous: undefined,
      next: undefined,
      results: MOCK_DATA,
    },
  }
}

export default useMessages
