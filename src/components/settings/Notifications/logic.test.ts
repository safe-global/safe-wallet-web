import * as firebase from 'firebase/messaging'
import { hexZeroPad } from 'ethers/lib/utils'
import { Web3Provider } from '@ethersproject/providers'
import { DeviceType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import * as sdk from '@safe-global/safe-gateway-typescript-sdk'
import type { JsonRpcSigner } from '@ethersproject/providers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import * as logic from './logic'
import packageJson from '../../../../package.json'

jest.mock('firebase/messaging')

jest.mock('@safe-global/safe-gateway-typescript-sdk')

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(),
  },
})

Object.defineProperty(globalThis, 'navigator', {
  value: {
    serviceWorker: {
      getRegistration: jest.fn(),
    },
  },
})

Object.defineProperty(globalThis, 'location', {
  value: {
    origin: 'https://app.safe.global',
  },
})

const mockProvider = new Web3Provider(jest.fn())

describe('Notifications', () => {
  let alertMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    window.alert = alertMock
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

      const result = await logic.requestNotificationPermission()

      expect(requestPermissionMock).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false if permission is denied', async () => {
      requestPermissionMock.mockResolvedValue('denied')

      const result = await logic.requestNotificationPermission()

      expect(requestPermissionMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    it('should return false if permission request throw', async () => {
      requestPermissionMock.mockImplementation(Promise.reject)

      const result = await logic.requestNotificationPermission()

      expect(requestPermissionMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    it('should return true if permission are granted', async () => {
      requestPermissionMock.mockResolvedValue('granted')

      const result = await logic.requestNotificationPermission()

      expect(requestPermissionMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(true)
    })
  })

  describe('createRegisterDevicePayload', () => {
    it('should return the current registration if it is the same', async () => {
      const token = crypto.randomUUID()
      const signature = hexZeroPad('0xDEAD', 65)

      jest.spyOn(firebase, 'getToken').mockImplementation(() => Promise.resolve(token))
      jest.spyOn(mockProvider, 'getSigner').mockImplementation(
        () =>
          ({
            signMessage: jest.fn().mockResolvedValue(signature),
          } as unknown as JsonRpcSigner),
      )

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration: logic.NotificationRegistration = {
        uuid: crypto.randomUUID(),
        cloudMessagingToken: token,
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: crypto.randomUUID(),
        safeRegistrations: [
          {
            chainId,
            safes: [safeAddress],
            signatures: [hexZeroPad('0xDEAD', 65)],
          },
        ],
      }

      const payload = await logic.createRegisterDevicePayload(
        { [chainId]: [safeAddress] },
        mockProvider,
        currentRegistration,
      )

      expect(payload).toStrictEqual({ ...currentRegistration, timestamp: expect.any(String) })
    })

    describe('should return a registration payload if the chain registration(s) is not already registered', () => {
      it('if none on the same chain is registered', async () => {
        const token = crypto.randomUUID()
        const signature = hexZeroPad('0xDEAD', 65)

        jest.spyOn(firebase, 'getToken').mockImplementation(() => Promise.resolve(token))
        jest.spyOn(mockProvider, 'getSigner').mockImplementation(
          () =>
            ({
              signMessage: jest.fn().mockResolvedValue(signature),
            } as unknown as JsonRpcSigner),
        )

        const safeAddress = hexZeroPad('0x1', 20)
        const chainId = '1'

        const payload = await logic.createRegisterDevicePayload({ [chainId]: [safeAddress] }, mockProvider)

        expect(payload).toStrictEqual({
          uuid: expect.any(String),
          cloudMessagingToken: token,
          buildNumber: '0',
          bundle: 'https://app.safe.global',
          deviceType: DeviceType.WEB,
          version: packageJson.version,
          timestamp: expect.any(String),
          safeRegistrations: [
            {
              chainId,
              safes: [safeAddress],
              signatures: [signature],
            },
          ],
        })
      })

      it('if others on the same chain exists', async () => {
        const token = crypto.randomUUID()
        const signature = hexZeroPad('0xDEAD', 65)

        jest.spyOn(firebase, 'getToken').mockImplementation(() => Promise.resolve(token))
        jest.spyOn(mockProvider, 'getSigner').mockImplementation(
          () =>
            ({
              signMessage: jest.fn().mockResolvedValue(signature),
            } as unknown as JsonRpcSigner),
        )

        const safeAddress = hexZeroPad('0x3', 20)
        const chainId = '1'

        const currentRegistration = {
          uuid: crypto.randomUUID(),
          cloudMessagingToken: token,
          buildNumber: '0',
          bundle: 'https://app.safe.global',
          deviceType: DeviceType.WEB,
          version: packageJson.version,
          timestamp: expect.any(String),
          safeRegistrations: [
            {
              chainId,
              safes: [hexZeroPad('0x1', 20), hexZeroPad('0x2', 20)],
              signatures: [hexZeroPad('0xBEEF', 65)],
            },
            {
              chainId: '2',
              safes: [hexZeroPad('0x4', 20)],
              signatures: [signature],
            },
          ],
        }

        const payload = await logic.createRegisterDevicePayload(
          { [chainId]: [safeAddress] },
          mockProvider,
          currentRegistration,
        )

        expect(payload.timestamp).not.toBe(currentRegistration.timestamp)
        expect(payload.safeRegistrations[0].signatures).not.toBe(currentRegistration.safeRegistrations[0].signatures)

        expect(payload).toStrictEqual({
          uuid: currentRegistration.uuid, // Same UUID
          cloudMessagingToken: expect.any(String),
          buildNumber: '0',
          bundle: 'https://app.safe.global',
          deviceType: DeviceType.WEB,
          version: packageJson.version,
          timestamp: expect.any(String),
          safeRegistrations: [
            {
              chainId,
              safes: [hexZeroPad('0x1', 20), hexZeroPad('0x2', 20), safeAddress],
              signatures: [signature],
            },
            {
              chainId: '2',
              safes: [hexZeroPad('0x4', 20)],
              signatures: [signature],
            },
          ],
        })
      })
    })
  })

  describe('registerNotifications', () => {
    const mockRegisterSafe = jest.spyOn(sdk, 'registerDevice')

    it('should return undefined if no registration exists and the registration threw', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      jest.spyOn(logic, 'requestNotificationPermission').mockImplementation(() => Promise.resolve(true))

      jest
        .spyOn(logic, 'createRegisterDevicePayload')
        .mockImplementation(() => Promise.resolve({} as logic.NotificationRegistration))

      mockRegisterSafe.mockImplementation(() => {
        return Promise.reject()
      })

      const registration = await logic.registerNotifications({ [chainId]: [safeAddress] }, mockProvider)

      expect(mockRegisterSafe).toHaveBeenCalledTimes(1)

      expect(alertMock).toHaveBeenCalledTimes(1)
      expect(alertMock).toHaveBeenCalledWith('Unable to register Safe(s)')

      expect(registration).toBe(undefined)
    })

    it('should return the current registration if one exists and the registration threw', async () => {
      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      jest.spyOn(logic, 'requestNotificationPermission').mockImplementation(() => Promise.resolve(true))

      jest
        .spyOn(logic, 'createRegisterDevicePayload')
        .mockImplementation(() => Promise.resolve({} as logic.NotificationRegistration))

      mockRegisterSafe.mockImplementation(() => {
        return Promise.reject()
      })

      const currentRegistration: logic.NotificationRegistration = {
        uuid: crypto.randomUUID(),
        cloudMessagingToken: crypto.randomUUID(),
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: crypto.randomUUID(),
        safeRegistrations: [
          {
            chainId,
            safes: [safeAddress],
            signatures: [hexZeroPad('0xDEAD', 65)],
          },
        ],
      }

      const registration = await logic.registerNotifications(
        { [chainId]: [safeAddress] },
        mockProvider,
        currentRegistration,
      )

      expect(mockRegisterSafe).toHaveBeenCalledTimes(1)

      expect(alertMock).toHaveBeenCalledTimes(1)
      expect(alertMock).toHaveBeenCalledWith('Unable to register Safe(s)')

      expect(registration).toBe(currentRegistration)
    })

    it('should return the registration payload if the registration succeeded', async () => {
      jest.spyOn(logic, 'requestNotificationPermission').mockImplementation(() => Promise.resolve(true))

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const registrationPayload: logic.NotificationRegistration = {
        uuid: crypto.randomUUID(),
        cloudMessagingToken: crypto.randomUUID(),
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: crypto.randomUUID(),
        safeRegistrations: [
          {
            chainId,
            safes: [safeAddress],
            signatures: [hexZeroPad('0xDEAD', 65)],
          },
        ],
      }

      jest.spyOn(logic, 'createRegisterDevicePayload').mockImplementation(() => Promise.resolve(registrationPayload))

      mockRegisterSafe.mockImplementation(() => {
        return Promise.resolve()
      })

      const registration = await logic.registerNotifications({ [chainId]: [safeAddress] }, mockProvider)

      expect(mockRegisterSafe).toHaveBeenCalledTimes(1)

      expect(alertMock).not.toHaveBeenCalled()

      expect(registration).not.toBe(registrationPayload)
    })
  })

  describe('unregisterSafe', () => {
    const mockUnregisterSafe = jest.spyOn(sdk, 'unregisterSafe')

    it('should return the current registration if the unregistration threw', async () => {
      mockUnregisterSafe.mockImplementation(() => {
        return Promise.reject()
      })

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration: logic.NotificationRegistration = {
        uuid: crypto.randomUUID(),
        cloudMessagingToken: crypto.randomUUID(),
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: crypto.randomUUID(),
        safeRegistrations: [
          {
            chainId,
            safes: [safeAddress],
            signatures: [hexZeroPad('0xDEAD', 65)],
          },
        ],
      }

      const updatedRegistration = await logic.unregisterSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        currentRegistration,
      )

      expect(mockUnregisterSafe).toHaveBeenCalledTimes(1)

      expect(alertMock).toHaveBeenCalledTimes(1)
      expect(alertMock).toHaveBeenCalledWith('Unable to unregister Safe')

      expect(updatedRegistration).toEqual(currentRegistration)
    })

    it('should return the updated registration if the registration succeeded', async () => {
      mockUnregisterSafe.mockImplementation(() => {
        return Promise.resolve()
      })

      const safeAddress = hexZeroPad('0x1', 20)
      const chainId = '1'

      const currentRegistration: logic.NotificationRegistration = {
        uuid: crypto.randomUUID(),
        cloudMessagingToken: crypto.randomUUID(),
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: crypto.randomUUID(),
        safeRegistrations: [
          {
            chainId,
            safes: [safeAddress, hexZeroPad('0x2', 20)],
            signatures: [hexZeroPad('0xDEAD', 65)],
          },
          {
            chainId: '5',
            safes: [safeAddress], // Same address Safe on a different chain
            signatures: [hexZeroPad('0xBEEF', 65)],
          },
        ],
      }

      const updatedRegistration = await logic.unregisterSafe(
        { chainId, address: { value: safeAddress } } as SafeInfo,
        currentRegistration,
      )

      expect(mockUnregisterSafe).toHaveBeenCalledTimes(1)

      expect(alertMock).not.toHaveBeenCalled()

      expect(updatedRegistration.timestamp).not.toBe(currentRegistration.timestamp)

      expect(updatedRegistration).toEqual({
        uuid: currentRegistration.uuid, // Same UUID
        cloudMessagingToken: currentRegistration.cloudMessagingToken, // Same token
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: expect.any(String),
        safeRegistrations: [
          {
            chainId,
            safes: [hexZeroPad('0x2', 20)],
            signatures: [],
          },
          {
            chainId: '5',
            safes: [safeAddress], // Same address Safe on a different chain
            signatures: [hexZeroPad('0xBEEF', 65)],
          },
        ],
      })
    })
  })
})
