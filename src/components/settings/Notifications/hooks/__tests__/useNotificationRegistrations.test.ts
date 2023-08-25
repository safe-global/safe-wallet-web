import { hexZeroPad } from 'ethers/lib/utils'
import * as sdk from '@safe-global/safe-gateway-typescript-sdk'

import { renderHook } from '@/tests/test-utils'
import { useNotificationRegistrations } from '../useNotificationRegistrations'
import * as logic from '../../logic'
import * as preferences from '../useNotificationPreferences'
import * as notificationsSlice from '@/store/notificationsSlice'
import { DeviceType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'

jest.mock('@safe-global/safe-gateway-typescript-sdk')

jest.mock('../useNotificationPreferences')

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(),
  },
})

describe('useNotificationRegistrations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerNotifications', () => {
    const registerDeviceSpy = jest.spyOn(sdk, 'registerDevice')

    const examplePayload: logic.NotificationRegistration = {
      uuid: self.crypto.randomUUID(),
      cloudMessagingToken: 'token',
      buildNumber: '0',
      bundle: 'https://app.safe.global',
      deviceType: DeviceType.WEB,
      version: '1.17.0',
      timestamp: Math.floor(new Date().getTime() / 1000).toString(),
      safeRegistrations: [
        {
          chainId: '1',
          safes: [hexZeroPad('0x1', 20)],
          signatures: [],
        },
      ],
    }

    it('does not register if no uuid is present', async () => {
      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: undefined,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.registerNotifications({})

      expect(registerDeviceSpy).not.toHaveBeenCalled()
    })

    it('does not create preferences/notify if registration does not succeed', async () => {
      jest.spyOn(logic, 'getRegisterDevicePayload').mockImplementation(() => Promise.resolve(examplePayload))

      // @ts-expect-error
      registerDeviceSpy.mockImplementation(() => Promise.resolve('Registration could not be completed.'))

      const createPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: self.crypto.randomUUID(),
            _createPreferences: createPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.registerNotifications({
        '1': [hexZeroPad('0x1', 20)],
        '2': [hexZeroPad('0x2', 20)],
      })

      expect(registerDeviceSpy).toHaveBeenCalledWith(examplePayload)

      expect(createPreferencesMock).not.toHaveBeenCalled()
    })

    it('does not create preferences/notify if registration throws', async () => {
      jest.spyOn(logic, 'getRegisterDevicePayload').mockImplementation(() => Promise.resolve(examplePayload))

      // @ts-expect-error
      registerDeviceSpy.mockImplementation(() => Promise.resolve('Registration could not be completed.'))

      const createPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: self.crypto.randomUUID(),
            _createPreferences: createPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.registerNotifications({
        '1': [hexZeroPad('0x1', 20)],
        '2': [hexZeroPad('0x2', 20)],
      })

      expect(registerDeviceSpy).toHaveBeenCalledWith(examplePayload)

      expect(createPreferencesMock).not.toHaveBeenCalledWith()
    })

    it('creates preferences if registration succeeds without signature for a single Safe Account', async () => {
      jest.spyOn(logic, 'getRegisterDevicePayload').mockImplementation(() => Promise.resolve(examplePayload))

      registerDeviceSpy.mockImplementation(() => Promise.resolve())

      const createPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: self.crypto.randomUUID(),
            _createPreferences: createPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const showNotificationSpy = jest.spyOn(notificationsSlice, 'showNotification')

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.registerNotifications({
        '1': [hexZeroPad('0x1', 20)],
      })

      expect(registerDeviceSpy).toHaveBeenCalledWith(examplePayload)

      expect(createPreferencesMock).toHaveBeenCalled()

      expect(showNotificationSpy).toHaveBeenCalledWith({
        message: 'You will now receive notifications for this Safe Account in your browser.',
        variant: 'success',
        groupKey: 'notifications',
      })
    })

    it('creates preferences if registration succeeds without signature for multiple Safe Accounts', async () => {
      jest.spyOn(logic, 'getRegisterDevicePayload').mockImplementation(() => Promise.resolve(examplePayload))

      const createPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: self.crypto.randomUUID(),
            _createPreferences: createPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const showNotificationSpy = jest.spyOn(notificationsSlice, 'showNotification')

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.registerNotifications({
        '1': [hexZeroPad('0x1', 20)],
        '2': [hexZeroPad('0x2', 20)],
      })

      expect(registerDeviceSpy).toHaveBeenCalledWith(examplePayload)

      expect(createPreferencesMock).toHaveBeenCalled()

      expect(showNotificationSpy).toHaveBeenCalledWith({
        message: 'You will now receive notifications for these Safe Accounts in your browser.',
        variant: 'success',
        groupKey: 'notifications',
      })
    })

    it('creates preferences/does not notify if registration succeeded with signature', async () => {
      jest.spyOn(logic, 'getRegisterDevicePayload').mockImplementation(() => Promise.resolve(examplePayload))

      registerDeviceSpy.mockImplementation(() => Promise.resolve())

      const createPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: self.crypto.randomUUID(),
            _createPreferences: createPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const showNotificationSpy = jest.spyOn(notificationsSlice, 'showNotification')

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.registerNotifications(
        {
          '1': [hexZeroPad('0x1', 20)],
          '2': [hexZeroPad('0x2', 20)],
        },
        true,
      )

      expect(registerDeviceSpy).toHaveBeenCalledWith(examplePayload)

      expect(createPreferencesMock).toHaveBeenCalled()

      expect(showNotificationSpy).not.toHaveBeenCalled()
    })
  })

  describe('unregisterSafeNotifications', () => {
    const unregisterSafeSpy = jest.spyOn(sdk, 'unregisterSafe')

    it('does not unregister if no uuid is present', async () => {
      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: undefined,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      await result.current.unregisterSafeNotifications('1', hexZeroPad('0x1', 20))

      expect(unregisterSafeSpy).not.toHaveBeenCalled()
    })

    it('does not delete preferences if unregistration does not succeed', async () => {
      // @ts-expect-error
      unregisterSafeSpy.mockImplementation(() => Promise.resolve('Unregistration could not be completed.'))

      const uuid = self.crypto.randomUUID()
      const deletePreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid,
            _deletePreferences: deletePreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      const chainId = '1'
      const safeAddress = hexZeroPad('0x1', 20)

      await result.current.unregisterSafeNotifications(chainId, safeAddress)

      expect(unregisterSafeSpy).toHaveBeenCalledWith(chainId, safeAddress, uuid)

      expect(deletePreferencesMock).not.toHaveBeenCalled()
    })

    it('does not delete preferences if unregistration throws', async () => {
      unregisterSafeSpy.mockImplementation(() => Promise.reject())

      const uuid = self.crypto.randomUUID()
      const deletePreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid,
            _deletePreferences: deletePreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      const chainId = '1'
      const safeAddress = hexZeroPad('0x1', 20)

      await result.current.unregisterSafeNotifications(chainId, safeAddress)

      expect(unregisterSafeSpy).toHaveBeenCalledWith(chainId, safeAddress, uuid)

      expect(deletePreferencesMock).not.toHaveBeenCalled()
    })

    it('deletes preferences if unregistration succeeds', async () => {
      unregisterSafeSpy.mockImplementation(() => Promise.resolve())

      const uuid = self.crypto.randomUUID()
      const deletePreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid,
            _deletePreferences: deletePreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      const chainId = '1'
      const safeAddress = hexZeroPad('0x1', 20)

      await result.current.unregisterSafeNotifications(chainId, safeAddress)

      expect(unregisterSafeSpy).toHaveBeenCalledWith(chainId, safeAddress, uuid)

      expect(deletePreferencesMock).toHaveBeenCalledWith({ [chainId]: [safeAddress] })
    })
  })

  describe('unregisterAllNotifications', () => {
    const unregisterDeviceSpy = jest.spyOn(sdk, 'unregisterDevice')

    it('does not unregister device if no uuid is present', () => {
      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid: undefined,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      result.current.unregisterAllNotifications()

      expect(unregisterDeviceSpy).not.toHaveBeenCalled()
    })

    it('does not clear preferences if unregistration does not succeed', () => {
      // @ts-expect-error
      unregisterDeviceSpy.mockImplementation(() => Promise.resolve('Unregistration could not be completed.'))

      const uuid = self.crypto.randomUUID()
      const clearPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid,
            _clearPreferences: clearPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      result.current.unregisterAllNotifications()

      expect(unregisterDeviceSpy).toHaveBeenCalledWith('1', uuid)

      expect(clearPreferencesMock).not.toHaveBeenCalled()
    })

    it('does not clear preferences if unregistration throws', () => {
      unregisterDeviceSpy.mockImplementation(() => Promise.resolve())

      const uuid = self.crypto.randomUUID()
      const clearPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid,
            _clearPreferences: clearPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      result.current.unregisterAllNotifications()

      expect(unregisterDeviceSpy).toHaveBeenCalledWith('1', uuid)

      expect(clearPreferencesMock).not.toHaveBeenCalledWith()
    })

    it('clears preferences if unregistration succeeds', () => {
      unregisterDeviceSpy.mockImplementation(() => Promise.resolve())

      const uuid = self.crypto.randomUUID()
      const clearPreferencesMock = jest.fn()

      ;(preferences.useNotificationPreferences as jest.Mock).mockImplementation(
        () =>
          ({
            uuid,
            _clearPreferences: clearPreferencesMock,
          } as unknown as ReturnType<typeof preferences.useNotificationPreferences>),
      )

      const { result } = renderHook(() => useNotificationRegistrations())

      result.current.unregisterAllNotifications()

      expect(unregisterDeviceSpy).toHaveBeenCalledWith('1', uuid)

      expect(clearPreferencesMock).not.toHaveBeenCalled()
    })
  })
})
