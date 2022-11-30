import { safeMsgDispatch, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { showNotification } from '@/store/notificationsSlice'
import { renderHook } from '@/tests/test-utils'
import useSafeMessageNotifications from '../useSafeMessageNotifications'

jest.mock('@/store/notificationsSlice', () => {
  const original = jest.requireActual('@/store/notificationsSlice')
  return {
    ...original,
    showNotification: jest.fn(original.showNotification),
  }
})

describe('useSafeMessageNotifications', () => {
  it('should show a notification when a message is created', () => {
    renderHook(() => useSafeMessageNotifications())

    safeMsgDispatch(SafeMsgEvent.PROPOSE, { messageHash: '0x123', signature: '0x456', requestId: '123' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'You successfully signed the message.',
      groupKey: '0x123',
      variant: 'success',
    })
  })

  it('should show a notification when a message creation fails', () => {
    renderHook(() => useSafeMessageNotifications())

    safeMsgDispatch(SafeMsgEvent.PROPOSE_FAILED, {
      messageHash: '0x456',
      error: new Error('Example error'),
    })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'Signing the message failed. Please try again.',
      detailedMessage: 'Example error',
      groupKey: '0x456',
      variant: 'error',
    })
  })

  it('should show a notification when a message is confirmed', () => {
    renderHook(() => useSafeMessageNotifications())

    safeMsgDispatch(SafeMsgEvent.CONFIRM_PROPOSE, { messageHash: '0x456' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'You successfully confirmed the message.',
      groupKey: '0x456',
      variant: 'info',
    })
  })

  it('should show a notification when a message confirmation fails', () => {
    renderHook(() => useSafeMessageNotifications())

    safeMsgDispatch(SafeMsgEvent.CONFIRM_PROPOSE_FAILED, {
      messageHash: '0x789',
      error: new Error('Other error'),
    })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'Confirming the message failed. Please try again.',
      detailedMessage: 'Other error',
      groupKey: '0x789',
      variant: 'error',
    })
  })

  it('should show a notification when a message fully is confirmed', () => {
    renderHook(() => useSafeMessageNotifications())

    safeMsgDispatch(SafeMsgEvent.SIGNATURE_PREPARED, { messageHash: '0x012' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'The message was successfully confirmed.',
      groupKey: '0x012',
      variant: 'success',
    })
  })
})
