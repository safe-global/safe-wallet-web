import { renderHook } from '@/tests/test-utils'
import * as useIsSignedMessagePendingHook from '@/hooks/useIsSignedMessagePending'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import useSignedMessageStatus from '../useSignedMessageStatus'
import type { SignedMessage, SignedMessageStatus } from '@/store/signedMessagesSlice'
import type { ConnectedWallet } from '@/services/onboard'

describe('useSignedMessageStatus', () => {
  it('should return "Confirming" if the message is pending', () => {
    jest.spyOn(useIsSignedMessagePendingHook, 'default').mockImplementation(() => true)

    const message = {} as SignedMessage

    const { result } = renderHook(() => useSignedMessageStatus(message))
    expect(result.current).toBe('Confirming')
  })

  it('should return "Awaiting confirmations" if the message is not pending, the wallet has signed it but it is not fully signed', () => {
    jest.spyOn(useIsSignedMessagePendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x123' } }],
      status: 'NEEDS_CONFIRMATION' as SignedMessageStatus,
    } as SignedMessage

    const { result } = renderHook(() => useSignedMessageStatus(message))
    expect(result.current).toBe('Awaiting confirmations')
  })

  it('should return the message status if the message is not pending and the wallet has not signed the message', () => {
    jest.spyOn(useIsSignedMessagePendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x456' } }] as SignedMessage['confirmations'],
      status: 'NEEDS_CONFIRMATION' as SignedMessageStatus,
    } as SignedMessage

    const { result } = renderHook(() => useSignedMessageStatus(message))
    expect(result.current).toBe('Needs confirmation')
  })

  it('should return the message status if the message is not pending and it is fully signed', () => {
    jest.spyOn(useIsSignedMessagePendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x123' } }] as SignedMessage['confirmations'],
      status: 'CONFIRMED' as SignedMessageStatus,
    } as SignedMessage

    const { result } = renderHook(() => useSignedMessageStatus(message))
    expect(result.current).toBe('Confirmed')
  })
})
