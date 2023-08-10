import { hexZeroPad } from 'ethers/lib/utils'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import * as notifications from '.'
import packageJson from '../../../../package.json'
import { Web3Provider } from '@ethersproject/providers'

const getRegisterDeviceDto = (
  safeRegistrations: notifications.RegisterDeviceDto['safeRegistrations'],
): notifications.RegisterDeviceDto => {
  return {
    uuid: 'uuid',
    cloudMessagingToken: 'token',
    buildNumber: '0',
    bundle: 'https://app.safe.global',
    deviceType: notifications.DeviceType.WEB,
    version: packageJson.version,
    timestamp: '69420',
    safeRegistrations,
  }
}

const mockProvider = new Web3Provider(jest.fn())

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('requestNotificationPermission', () => {
    let requestPermissionMock = jest.fn()

    beforeEach(() => {
      globalThis.Notification = {
        requestPermission: requestPermissionMock,
        permission: 'default',
      } as unknown as jest.Mocked<typeof Notification>
    })

    it('should return true and not request permission again if already granted', async () => {
      globalThis.Notification = {
        requestPermission: requestPermissionMock,
        permission: 'granted',
      } as unknown as jest.Mocked<typeof Notification>

      const result = await notifications._requestNotificationPermission()

      expect(requestPermissionMock).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false if permission is denied', async () => {
      requestPermissionMock.mockResolvedValue('denied')

      const result = await notifications._requestNotificationPermission()

      expect(requestPermissionMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    it('should return false if permission request throw', async () => {
      requestPermissionMock.mockImplementation(Promise.reject)

      const result = await notifications._requestNotificationPermission()

      expect(requestPermissionMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    it('should return true if permission are granted', async () => {
      requestPermissionMock.mockResolvedValue('granted')

      const result = await notifications._requestNotificationPermission()

      expect(requestPermissionMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(true)
    })
  })

  describe('createRegisterSafePayload', () => {
    it('should return the current registrations if the safe is already registered', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0xDEAD', 65)],
        },
      ])

      const payload = await notifications._createRegisterSafePayload(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        mockProvider,
        currentRegistration,
      )

      expect(payload).toBe(currentRegistration)
    })

    describe('should return a registration payload if the safe is not already registered', () => {
      it.todo('should just be the current Safe if none is registered on the current chain')

      it.todo('should append the Safe if one is already registered on the chain')
    })
  })

  describe('registerSafe', () => {
    it.skip('should return undefined if no registration exists and the registration failed', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const registrationPayload = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      jest
        .spyOn(notifications, '_createRegisterSafePayload')
        .mockImplementation(jest.fn().mockResolvedValue(registrationPayload))

      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
          status: 69420, // Failed
          ok: true,
        })
      })

      const registration = await notifications._registerSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        mockProvider,
      )

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(registration).toBe(undefined)
    })

    it.skip('should return the registration payload if one exists and the registration failed', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const registrationPayload = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      jest
        .spyOn(notifications, '_createRegisterSafePayload')
        .mockImplementation(jest.fn().mockResolvedValue(registrationPayload))

      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
          status: 69420, // Failed
          ok: true,
        })
      })

      const currentRegistration = getRegisterDeviceDto([
        {
          chainId,
          safes: [hexZeroPad('0x2', 20)],
          signatures: [hexZeroPad('0xDEAD', 65)],
        },
      ])

      const registration = await notifications._registerSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        mockProvider,
        currentRegistration,
      )

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(registration).toBe(currentRegistration)
    })

    it.skip('should return undefined if no registration exists and the registration threw', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const registrationPayload = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      jest
        .spyOn(notifications, '_createRegisterSafePayload')
        .mockImplementation(jest.fn().mockResolvedValue(registrationPayload))

      const registration = await notifications._registerSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        mockProvider,
      )

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(registration).toBe(undefined)
    })

    it.skip('should return the registration payload if one exists and the registration threw', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const registrationPayload = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      jest.spyOn(notifications, '_createRegisterSafePayload').mockImplementation(() => {
        return Promise.resolve(registrationPayload)
      })

      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.reject()
      })

      const currentRegistration = getRegisterDeviceDto([
        {
          chainId,
          safes: [hexZeroPad('0x2', 20)],
          signatures: [hexZeroPad('0xDEAD', 65)],
        },
      ])

      const registration = await notifications._registerSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        mockProvider,
        currentRegistration,
      )

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(registration).toBe(currentRegistration)
    })

    it.skip('should return the registration payload if the registration succeeded', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const registrationPayload = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      jest
        .spyOn(notifications, '_createRegisterSafePayload')
        .mockImplementation(jest.fn().mockResolvedValue(registrationPayload))

      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
          status: 200,
          ok: true,
        })
      })

      const registration = await notifications._registerSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        mockProvider,
      )

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(registration).toBe(registrationPayload)
    })
  })

  describe('unregisterSafe', () => {
    it('should return the current registration if the unregistration was unsuccessful', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
          status: 69420, // Failed
          ok: true,
        })
      })

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      const updatedRegistration = await notifications._unregisterSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        currentRegistration,
      )

      expect(updatedRegistration).toEqual(currentRegistration)
    })

    it('should return the current registration if the unregistration threw', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.reject()
      })

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
      ])

      const updatedRegistration = await notifications._unregisterSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        currentRegistration,
      )

      expect(updatedRegistration).toEqual(currentRegistration)
    })

    it('should return the updated registration if the registration succeeded', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
          status: 200,
          ok: true,
        })
      })

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration = getRegisterDeviceDto([
        {
          chainId,
          safes: [safeAddress, hexZeroPad('0x2', 20)],
          signatures: [hexZeroPad('0x5AFE', 65)],
        },
        {
          chainId: '5',
          safes: [safeAddress], // Same address Safe on a different chain
          signatures: [hexZeroPad('0xDEAD', 65)],
        },
      ])

      const updatedRegistration = await notifications._unregisterSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        currentRegistration,
      )

      expect(updatedRegistration).toEqual(
        getRegisterDeviceDto([
          {
            chainId,
            safes: [hexZeroPad('0x2', 20)],
            signatures: [],
          },
          currentRegistration.safeRegistrations[1],
        ]),
      )
    })
  })
})
