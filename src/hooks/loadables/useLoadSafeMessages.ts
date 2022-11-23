import { useEffect } from 'react'

import useAsync from '@/hooks/useAsync'
import { logError, Errors } from '@/services/exceptions'
import useSafeInfo from '@/hooks/useSafeInfo'
import { SafeMessageListItemType, SafeMessageStatus } from '@/store/safeMessagesSlice'
import type { AsyncResult } from '@/hooks/useAsync'
import type { SafeMessageListPage } from '@/store/safeMessagesSlice'

const MOCK_DATA: SafeMessageListPage['results'] = [
  {
    type: SafeMessageListItemType.DATE_LABEL,
    timestamp: Date.now(),
  },
  {
    type: SafeMessageListItemType.MESSAGE,
    messageHash: '0x123',
    status: SafeMessageStatus.NEEDS_CONFIRMATION,
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
    type: SafeMessageListItemType.MESSAGE,
    messageHash: '0x456',
    status: SafeMessageStatus.NEEDS_CONFIRMATION,
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
    type: SafeMessageListItemType.MESSAGE,
    messageHash: '0x456',
    status: SafeMessageStatus.CONFIRMED,
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

export const useLoadMessages = (): AsyncResult<SafeMessageListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()

  const [data, error, loading] = useAsync<SafeMessageListPage>(() => {
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
