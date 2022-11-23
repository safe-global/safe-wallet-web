import { renderHook } from '@/tests/test-utils'
import { signedMessageDispatch, SignedMessageEvent } from '@/services/signed-messages/signedMessageEvents'
import { setPendingSignedMessage, clearPendingSignedMessage } from '@/store/pendingSignedMessagesSlice'
import useSignedMessagePendingStatuses from '../useSignedMessagePendingStatuses'

jest.mock('@/store/pendingSignedMessagesSlice', () => {
  const original = jest.requireActual('@/store/pendingSignedMessagesSlice')
  return {
    ...original,
    setPendingSignedMessage: jest.fn(original.setPendingSignedMessage),
    clearPendingSignedMessage: jest.fn(original.clearPendingSignedMessage),
  }
})

describe('useSignedMessagePendingStatuses', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should set a message as pending when it is created', () => {
    renderHook(() => useSignedMessagePendingStatuses())

    signedMessageDispatch(SignedMessageEvent.PROPOSE, { messageHash: '0x123' })

    expect(clearPendingSignedMessage).not.toHaveBeenCalled()
    expect(setPendingSignedMessage).toHaveBeenCalledWith('0x123')
  })

  it('should unset a message as pending when creation failed', () => {
    renderHook(() => useSignedMessagePendingStatuses())

    signedMessageDispatch(SignedMessageEvent.PROPOSE_FAILED, {
      messageHash: '0x456',
      error: Error(),
    })

    expect(clearPendingSignedMessage).toHaveBeenCalledWith('0x456')
    expect(setPendingSignedMessage).not.toHaveBeenCalled()
  })

  it('should set a message as pending when it is confirmed', () => {
    renderHook(() => useSignedMessagePendingStatuses())

    signedMessageDispatch(SignedMessageEvent.CONFIRM_PROPOSE, { messageHash: '0x789' })

    expect(clearPendingSignedMessage).not.toHaveBeenCalled()
    expect(setPendingSignedMessage).toHaveBeenCalledWith('0x789')
  })

  it('should unset a message as pending when confirmation failed', () => {
    renderHook(() => useSignedMessagePendingStatuses())

    signedMessageDispatch(SignedMessageEvent.CONFIRM_PROPOSE_FAILED, { messageHash: '0x012', error: Error() })

    expect(clearPendingSignedMessage).toHaveBeenCalledWith('0x012')
    expect(setPendingSignedMessage).not.toHaveBeenCalled()
  })

  it('should unset a message as pending when it was saved', () => {
    renderHook(() => useSignedMessagePendingStatuses())

    signedMessageDispatch(SignedMessageEvent.UPDATED, { messageHash: '0x345' })

    expect(clearPendingSignedMessage).toHaveBeenCalledWith('0x345')
    expect(setPendingSignedMessage).not.toHaveBeenCalled()
  })

  it('should unset a message as pending when it is fully confirmed', () => {
    renderHook(() => useSignedMessagePendingStatuses())

    signedMessageDispatch(SignedMessageEvent.SIGNATURE_PREPARED, { messageHash: '0x678' })

    expect(clearPendingSignedMessage).toHaveBeenCalledWith('0x678')
    expect(setPendingSignedMessage).not.toHaveBeenCalled()
  })
})
