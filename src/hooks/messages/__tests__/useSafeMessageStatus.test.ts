import type { SafeMessage, SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'

import { renderHook } from '@/tests/test-utils'
import * as useIsSafeMessagePendingHook from '@/hooks/messages/useIsSafeMessagePending'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import useSafeMessageStatus from '../useSafeMessageStatus'
import type { ConnectedWallet } from '@/services/onboard'

describe('useSafeMessageStatus', () => {
  it('should return "Confirming" if the message is pending', () => {
    jest.spyOn(useIsSafeMessagePendingHook, 'default').mockImplementation(() => true)

    const message = {} as SafeMessage

    const { result } = renderHook(() => useSafeMessageStatus(message))
    expect(result.current).toBe('Confirming')
  })

  it('should return "Awaiting confirmations" if the message is not pending, the wallet has signed it but it is not fully signed', () => {
    jest.spyOn(useIsSafeMessagePendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x123' } }],
      status: 'NEEDS_CONFIRMATION' as SafeMessageStatus,
    } as SafeMessage

    const { result } = renderHook(() => useSafeMessageStatus(message))
    expect(result.current).toBe('Awaiting confirmations')
  })

  it('should return the message status if the message is not pending and the wallet has not signed the message', () => {
    jest.spyOn(useIsSafeMessagePendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x456' } }] as SafeMessage['confirmations'],
      status: 'NEEDS_CONFIRMATION' as SafeMessageStatus,
    } as SafeMessage

    const { result } = renderHook(() => useSafeMessageStatus(message))
    expect(result.current).toBe('Needs confirmation')
  })

  it('should return the message status if the message is not pending and it is fully signed', () => {
    jest.spyOn(useIsSafeMessagePendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x123' } }] as SafeMessage['confirmations'],
      status: 'CONFIRMED' as SafeMessageStatus,
    } as SafeMessage

    const { result } = renderHook(() => useSafeMessageStatus(message))
    expect(result.current).toBe('Confirmed')
  })
})
