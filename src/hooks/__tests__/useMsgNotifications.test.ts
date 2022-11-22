import { msgDispatch, MsgEvent } from '@/services/msg/msgEvents'
import { showNotification } from '@/store/notificationsSlice'
import { renderHook } from '@/tests/test-utils'
import useMsgNotifications from '../useMsgNotifications'

jest.mock('@/store/notificationsSlice', () => {
  const original = jest.requireActual('@/store/notificationsSlice')
  return {
    ...original,
    showNotification: jest.fn(original.showNotification),
  }
})

describe('useMsgNotifications', () => {
  it('should show a notification when a message is created', () => {
    renderHook(() => useMsgNotifications())

    msgDispatch(MsgEvent.CREATE, { messageHash: '0x123' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'You successfully signed the message.',
      groupKey: '0x123',
      variant: 'info',
    })
  })

  it('should show a notification when a message creation fails', () => {
    renderHook(() => useMsgNotifications())

    msgDispatch(MsgEvent.CREATE_FAILED, { error: new Error('Example error') })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'Signing the message failed. Please try again.',
      detailedMessage: 'Example error',
      groupKey: '',
      variant: 'error',
    })
  })

  it('should show a notification when a message is confirmed', () => {
    renderHook(() => useMsgNotifications())

    msgDispatch(MsgEvent.CONFIRM, { messageHash: '0x456' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'You successfully confirmed the message.',
      groupKey: '0x456',
      variant: 'info',
    })
  })

  it('should show a notification when a message confirmation fails', () => {
    renderHook(() => useMsgNotifications())

    msgDispatch(MsgEvent.CONFIRM_FAILED, { messageHash: '0x789', error: new Error('Other error') })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'Confirming the message failed. Please try again.',
      detailedMessage: 'Other error',
      groupKey: '0x789',
      variant: 'error',
    })
  })

  it('should show a notification when a message fully is confirmed', () => {
    renderHook(() => useMsgNotifications())

    msgDispatch(MsgEvent.FULLY_CONFIRMED, { messageHash: '0x012' })

    expect(showNotification).toHaveBeenCalledWith({
      message: 'The message was successfully confirmed.',
      groupKey: '0x012',
      variant: 'success',
    })
  })
})
