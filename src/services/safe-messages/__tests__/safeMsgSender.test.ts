import * as gateway from '@gnosis.pm/safe-react-gateway-sdk'

import { dispatchSafeMsgConfirmation, dispatchSafeMsgProposal } from '@/services/safe-messages/safeMsgSender'
import * as utils from '@/utils/safe-messages'
import * as events from '@/services/safe-messages/safeMsgEvents'
import * as web3 from '@/utils/web3'

jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  ...jest.requireActual('@gnosis.pm/safe-react-gateway-sdk'),
  proposeSafeMessage: jest.fn(),
  confirmSafeMessage: jest.fn(),
}))

describe('safeMsgSender', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('dispatchSafeMsgProposal', () => {
    it('should dispatch a message proposal', async () => {
      jest.spyOn(utils, 'generateSafeMessageHash').mockImplementation(() => '0x123')

      const signTypedDataSpy = jest.spyOn(web3, 'signTypedData')
      signTypedDataSpy.mockImplementation(() => Promise.resolve('0x456'))

      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'
      const safeAppId = 1

      await dispatchSafeMsgProposal(safe, message, requestId, safeAppId)

      expect(proposeSafeMessageSpy).toHaveBeenCalledWith(1, '0x789', {
        message,
        signature: '0x456',
        safeAppId,
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.PROPOSE, {
        messageHash: '0x123',
        requestId,
      })
    })
    it('should dispatch a message proposal failure', async () => {
      jest.spyOn(utils, 'generateSafeMessageHash').mockImplementation(() => '0x123')

      const signTypedDataSpy = jest.spyOn(web3, 'signTypedData')
      signTypedDataSpy.mockImplementation(() => Promise.resolve('0x456'))

      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.reject(new Error('Example error')))

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'
      const safeAppId = 1

      try {
        await dispatchSafeMsgProposal(safe, message, requestId, safeAppId)
      } catch (e) {
        expect((e as Error).message).toBe('Example error')

        expect(proposeSafeMessageSpy).toHaveBeenCalledWith(1, '0x789', {
          message,
          signature: '0x456',
          safeAppId,
        })

        expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.PROPOSE_FAILED, {
          messageHash: '0x123',
          error: expect.any(Error),
        })
      }
    })
  })

  describe('dispatchSafeMsgConfirmation', () => {
    it('should dispatch a message proposal', async () => {
      jest.spyOn(utils, 'generateSafeMessageHash').mockImplementation(() => '0x123')

      const signTypedDataSpy = jest.spyOn(web3, 'signTypedData')
      signTypedDataSpy.mockImplementation(() => Promise.resolve('0x456'))

      const confirmSafeMessageSpy = jest.spyOn(gateway, 'confirmSafeMessage')
      confirmSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'

      await dispatchSafeMsgConfirmation(safe, message, requestId)

      expect(confirmSafeMessageSpy).toHaveBeenCalledWith(1, '0x123', {
        signature: '0x456',
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.CONFIRM_PROPOSE, {
        messageHash: '0x123',
        requestId,
      })
    })
    it('should dispatch a message proposal failure', async () => {
      jest.spyOn(utils, 'generateSafeMessageHash').mockImplementation(() => '0x123')

      const signTypedDataSpy = jest.spyOn(web3, 'signTypedData')
      signTypedDataSpy.mockImplementation(() => Promise.resolve('0x456'))

      const confirmSafeMessageSpy = jest.spyOn(gateway, 'confirmSafeMessage')
      confirmSafeMessageSpy.mockImplementation(() => Promise.reject(new Error('Example error')))

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'

      try {
        await dispatchSafeMsgConfirmation(safe, message, requestId)
      } catch (e) {
        expect((e as Error).message).toBe('Example error')

        expect(confirmSafeMessageSpy).toHaveBeenCalledWith(1, '0x123', {
          signature: '0x456',
        })

        expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.CONFIRM_PROPOSE_FAILED, {
          messageHash: '0x123',
          error: expect.any(Error),
        })
      }
    })
  })
})
