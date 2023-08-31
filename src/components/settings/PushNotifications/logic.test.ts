import * as firebase from 'firebase/messaging'
import { DeviceType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import { hexZeroPad } from 'ethers/lib/utils'
import { Web3Provider } from '@ethersproject/providers'
import type { JsonRpcSigner } from '@ethersproject/providers'

import * as logic from './logic'
import packageJson from '../../../../package.json'

jest.mock('firebase/messaging')

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

  describe('getRegisterDevicePayload', () => {
    it('should return the payload with signature', async () => {
      const token = crypto.randomUUID()
      jest.spyOn(firebase, 'getToken').mockImplementation(() => Promise.resolve(token))

      const mockProvider = new Web3Provider(jest.fn())
      const signature = hexZeroPad('0x69420', 65)

      jest.spyOn(mockProvider, 'getSigner').mockImplementation(
        () =>
          ({
            signMessage: jest.fn().mockResolvedValueOnce(signature),
          } as unknown as JsonRpcSigner),
      )

      const uuid = crypto.randomUUID()

      const payload = await logic.getRegisterDevicePayload({
        safesToRegister: {
          ['1']: [hexZeroPad('0x1', 20), hexZeroPad('0x2', 20)],
          ['2']: [hexZeroPad('0x1', 20)],
        },
        uuid,
        web3: mockProvider,
      })

      expect(payload).toStrictEqual({
        uuid,
        cloudMessagingToken: token,
        buildNumber: '0',
        bundle: 'https://app.safe.global',
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp: expect.any(String),
        safeRegistrations: [
          {
            chainId: '1',
            safes: [hexZeroPad('0x1', 20), hexZeroPad('0x2', 20)],
            signatures: [signature],
          },
          {
            chainId: '2',
            safes: [hexZeroPad('0x1', 20)],
            signatures: [signature],
          },
        ],
      })
    })
  })
})
