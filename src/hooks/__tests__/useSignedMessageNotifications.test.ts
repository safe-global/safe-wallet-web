import { signedMessageDispatch, SignedMessageEvent } from '@/services/signed-messages/signedMessageEvents'
import { showNotification } from '@/store/notificationsSlice'
import { renderHook } from '@/tests/test-utils'
import useSignedMessageNotifications from '../useSignedMessageNotifications'

jest.mock('@/store/notificationsSlice', () => {
  const original = jest.requireActual('@/store/notificationsSlice')
  return {
    ...original,
    showNotification: jest.fn(original.showNotification),
  }
})

describe('useSignedMessageNotifications', () => {
  it('should show a notification when a message is created', () => {
    renderHook(() => useSignedMessageNotifications())

    signedMessageDispatch(SignedMessageEvent.PROPOSE, { messageHash: '0x123' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'You successfully signed the message.',
      groupKey: '0x123',
      variant: 'success',
    })
  })

  it('should show a notification when a message creation fails', () => {
    renderHook(() => useSignedMessageNotifications())

    signedMessageDispatch(SignedMessageEvent.PROPOSE_FAILED, {
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
    renderHook(() => useSignedMessageNotifications())

    signedMessageDispatch(SignedMessageEvent.CONFIRM_PROPOSE, { messageHash: '0x456' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'You successfully confirmed the message.',
      groupKey: '0x456',
      variant: 'info',
    })
  })

  it('should show a notification when a message confirmation fails', () => {
    renderHook(() => useSignedMessageNotifications())

    signedMessageDispatch(SignedMessageEvent.CONFIRM_PROPOSE_FAILED, {
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
    renderHook(() => useSignedMessageNotifications())

    signedMessageDispatch(SignedMessageEvent.SIGNATURE_PREPARED, { messageHash: '0x012' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'The message was successfully confirmed.',
      groupKey: '0x012',
      variant: 'success',
    })
  })
})
