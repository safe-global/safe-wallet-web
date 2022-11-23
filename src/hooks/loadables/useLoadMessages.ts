import { useEffect } from 'react'

import useAsync from '@/hooks/useAsync'
import { logError, Errors } from '@/services/exceptions'
import useSafeInfo from '@/hooks/useSafeInfo'
import { SignedMessageListItemType, SignedMessageStatus } from '@/store/signedMessagesSlice'
import type { AsyncResult } from '@/hooks/useAsync'
import type { SignedMessageListPage } from '@/store/signedMessagesSlice'

const MOCK_DATA: SignedMessageListPage['results'] = [
  {
    type: SignedMessageListItemType.DATE_LABEL,
    timestamp: Date.now(),
  },
  {
    type: SignedMessageListItemType.MESSAGE,
    messageHash: '0x123',
    status: SignedMessageStatus.NEEDS_CONFIRMATION,
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
    type: SignedMessageListItemType.MESSAGE,
    messageHash: '0x456',
    status: SignedMessageStatus.NEEDS_CONFIRMATION,
    logoUri: '',
    name: 'Example dApp',
    message: {
      example: 'Typed data message',
    },
    creationTimestamp: Date.now(),
    modifiedTimestamp: Date.now(),
    confirmationsSubmitted: 1,
    confirmationsRequired: 2,
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
  {
    type: SignedMessageListItemType.MESSAGE,
    messageHash: '0x456',
    status: SignedMessageStatus.CONFIRMED,
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

export const useLoadMessages = (): AsyncResult<SignedMessageListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()

  const [data, error, loading] = useAsync<SignedMessageListPage>(() => {
    if (!safeLoaded) {
      return
    }
    return Promise.resolve({
      next: undefined,
      previous: undefined,
      results: MOCK_DATA,
    })
  }, [safeLoaded, safe.chainId, safeAddress])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._608, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadMessages
