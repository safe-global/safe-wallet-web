import { renderHook } from '@/tests/test-utils'
import { safeMsgDispatch, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { setPendingSafeMessage, clearPendingSafeMessage } from '@/store/pendingSafeMessagesSlice'
import useSafeMessagePendingStatuses from '../useSafeMessagePendingStatuses'

jest.mock('@/store/pendingSafeMessagesSlice', () => {
  const original = jest.requireActual('@/store/pendingSafeMessagesSlice')
  return {
    ...original,
    setPendingSafeMessage: jest.fn(original.setPendingSafeMessage),
    clearPendingSafeMessage: jest.fn(original.clearPendingSafeMessage),
  }
})

describe('useSafeMessagePendingStatuses', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should set a message as pending when it is created', () => {
    renderHook(() => useSafeMessagePendingStatuses())

    safeMsgDispatch(SafeMsgEvent.PROPOSE, { messageHash: '0x123', requestId: '123' })

    expect(clearPendingSafeMessage).not.toHaveBeenCalled()
    expect(setPendingSafeMessage).toHaveBeenCalledWith('0x123')
  })

  it('should unset a message as pending when creation failed', () => {
    renderHook(() => useSafeMessagePendingStatuses())

    safeMsgDispatch(SafeMsgEvent.PROPOSE_FAILED, {
      messageHash: '0x456',
      error: Error(),
    })

    expect(clearPendingSafeMessage).toHaveBeenCalledWith('0x456')
    expect(setPendingSafeMessage).not.toHaveBeenCalled()
  })

  it('should set a message as pending when it is confirmed', () => {
    renderHook(() => useSafeMessagePendingStatuses())

    safeMsgDispatch(SafeMsgEvent.CONFIRM_PROPOSE, { messageHash: '0x789' })

    expect(clearPendingSafeMessage).not.toHaveBeenCalled()
    expect(setPendingSafeMessage).toHaveBeenCalledWith('0x789')
  })

  it('should unset a message as pending when confirmation failed', () => {
    renderHook(() => useSafeMessagePendingStatuses())

    safeMsgDispatch(SafeMsgEvent.CONFIRM_PROPOSE_FAILED, { messageHash: '0x012', error: Error() })

    expect(clearPendingSafeMessage).toHaveBeenCalledWith('0x012')
    expect(setPendingSafeMessage).not.toHaveBeenCalled()
  })

  it('should unset a message as pending when it was saved', () => {
    renderHook(() => useSafeMessagePendingStatuses())

    safeMsgDispatch(SafeMsgEvent.UPDATED, { messageHash: '0x345' })

    expect(clearPendingSafeMessage).toHaveBeenCalledWith('0x345')
    expect(setPendingSafeMessage).not.toHaveBeenCalled()
  })

  it('should unset a message as pending when it is fully confirmed', () => {
    renderHook(() => useSafeMessagePendingStatuses())

    safeMsgDispatch(SafeMsgEvent.SIGNATURE_PREPARED, { messageHash: '0x678' })

    expect(clearPendingSafeMessage).toHaveBeenCalledWith('0x678')
    expect(setPendingSafeMessage).not.toHaveBeenCalled()
  })
})
