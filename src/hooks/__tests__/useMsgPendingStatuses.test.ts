import { renderHook } from '@/tests/test-utils'
import { msgDispatch, MsgEvent } from '@/services/msg/msgEvents'
import { setPendingMsg, clearPendingMsg } from '@/store/pendingMsgsSlice'
import useMsgPendingStatuses from '../useMsgPendingStatuses'

jest.mock('@/store/pendingMsgsSlice', () => {
  const original = jest.requireActual('@/store/pendingMsgsSlice')
  return {
    ...original,
    setPendingMsg: jest.fn(original.setPendingMsg),
    clearPendingMsg: jest.fn(original.clearPendingSlide),
  }
})

describe('useMsgPendingStatuses', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should set a message as pending when it is created', () => {
    renderHook(() => useMsgPendingStatuses())

    msgDispatch(MsgEvent.PROPOSE, { messageHash: '0x123' })

    expect(clearPendingMsg).not.toHaveBeenCalled()
    expect(setPendingMsg).toHaveBeenCalledWith('0x123')
  })

  it('should unset a message as pending when creation failed', () => {
    renderHook(() => useMsgPendingStatuses())

    msgDispatch(MsgEvent.PROPOSE_FAILED, {
      messageHash: '0x456',
      error: Error(),
    })

    // Not `messageHash` exists in the event detail
    expect(setPendingMsg).not.toHaveBeenCalled()
    expect(clearPendingMsg).not.toHaveBeenCalled()
  })

  it('should set a message as pending when it is confirmed', () => {
    renderHook(() => useMsgPendingStatuses())

    msgDispatch(MsgEvent.CONFIRM_PROPOSE, { messageHash: '0x789' })

    expect(clearPendingMsg).not.toHaveBeenCalled()
    expect(setPendingMsg).toHaveBeenCalledWith('0x789')
  })

  it('should unset a message as pending when confirmation failed', () => {
    renderHook(() => useMsgPendingStatuses())

    msgDispatch(MsgEvent.CONFIRM_PROPOSE_FAILED, { messageHash: '0x012', error: Error() })

    expect(clearPendingMsg).toHaveBeenCalledWith('0x012')
    expect(setPendingMsg).not.toHaveBeenCalled()
  })

  it('should unset a message as pending when it was saved', () => {
    renderHook(() => useMsgPendingStatuses())

    msgDispatch(MsgEvent.UPDATED, { messageHash: '0x345' })

    expect(clearPendingMsg).toHaveBeenCalledWith('0x345')
    expect(setPendingMsg).not.toHaveBeenCalled()
  })

  it('should unset a message as pending when it is fully confirmed', () => {
    renderHook(() => useMsgPendingStatuses())

    msgDispatch(MsgEvent.SIGNATURE_PREPARED, { messageHash: '0x678' })

    expect(clearPendingMsg).toHaveBeenCalledWith('0x678')
    expect(setPendingMsg).not.toHaveBeenCalled()
  })
})
