import { renderHook } from '@/tests/test-utils'
import * as useIsMsgPendingHook from '@/hooks/useIsMsgPending'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import useMessageStatus from '../useMessageStatus'
import type { Message, MessageStatus } from '@/store/msgsSlice'
import type { ConnectedWallet } from '@/services/onboard'

describe('useMessageStatus', () => {
  it('should return "Confirming" if the message is pending', () => {
    jest.spyOn(useIsMsgPendingHook, 'default').mockImplementation(() => true)

    const message = {} as Message

    const { result } = renderHook(() => useMessageStatus(message))
    expect(result.current).toBe('Confirming')
  })

  it('should return "Awaiting confirmations" if the message is not pending, the wallet has signed it but it is not fully signed', () => {
    jest.spyOn(useIsMsgPendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x123' } }],
      status: 'NEEDS_CONFIRMATION' as MessageStatus,
    } as Message

    const { result } = renderHook(() => useMessageStatus(message))
    expect(result.current).toBe('Awaiting confirmations')
  })

  it('should return the message status if the message is not pending and the wallet has not signed the message', () => {
    jest.spyOn(useIsMsgPendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x456' } }] as Message['confirmations'],
      status: 'NEEDS_CONFIRMATION' as MessageStatus,
    } as Message

    const { result } = renderHook(() => useMessageStatus(message))
    expect(result.current).toBe('Needs confirmation')
  })

  it('should return the message status if the message is not pending and it is fully signed', () => {
    jest.spyOn(useIsMsgPendingHook, 'default').mockImplementation(() => false)
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({ address: '0x123' } as ConnectedWallet))

    const message = {
      confirmations: [{ owner: { value: '0x123' } }] as Message['confirmations'],
      status: 'CONFIRMED' as MessageStatus,
    } as Message

    const { result } = renderHook(() => useMessageStatus(message))
    expect(result.current).toBe('Confirmed')
  })
})
