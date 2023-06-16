import * as gateway from '@safe-global/safe-gateway-typescript-sdk'
import type { JsonRpcSigner } from '@ethersproject/providers'

import { dispatchSafeMsgConfirmation, dispatchSafeMsgProposal } from '@/services/safe-messages/safeMsgSender'
import * as utils from '@/utils/safe-messages'
import * as events from '@/services/safe-messages/safeMsgEvents'
import * as sdk from '@/services/tx/tx-sender/sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import type { EIP1193Provider, OnboardAPI, WalletState, AppState } from '@web3-onboard/core'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  proposeSafeMessage: jest.fn(),
  confirmSafeMessage: jest.fn(),
}))

let mockProvider = {
  request: jest.fn,
} as unknown as EIP1193Provider

const mockOnboardState = {
  chains: [],
  walletModules: [],
  wallets: [
    {
      label: 'Wallet 1',
      icon: '',
      provider: mockProvider,
      chains: [{ id: '0x5' }],
      accounts: [
        {
          address: '0x1234567890123456789012345678901234567890',
          ens: null,
          balance: null,
        },
      ],
    },
  ] as WalletState[],
  accountCenter: {
    enabled: true,
  },
} as unknown as AppState

const mockOnboard = {
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  setChain: jest.fn(),
  state: {
    select: (key: keyof AppState) => ({
      subscribe: (next: any) => {
        next(mockOnboardState[key])

        return {
          unsubscribe: jest.fn(),
        }
      },
    }),
    get: () => mockOnboardState,
  },
} as unknown as OnboardAPI

const mockValidSignature = `${hexZeroPad('0x456', 64)}1c`
const mockSignatureWithInvalidV = `${hexZeroPad('0x456', 64)}01`

describe('safeMsgSender', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(utils, 'generateSafeMessageHash').mockImplementation(() => '0x123')

    jest.spyOn(sdk, 'getAssertedChainSigner').mockResolvedValue({
      _signTypedData: jest.fn().mockImplementation(() => Promise.resolve(mockValidSignature)),
    } as unknown as JsonRpcSigner)
  })

  describe('dispatchSafeMsgProposal', () => {
    it('should dispatch a message proposal', async () => {
      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '5',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const safeAppId = 1

      await dispatchSafeMsgProposal({ onboard: mockOnboard, safe, message, safeAppId })

      expect(proposeSafeMessageSpy).toHaveBeenCalledWith('5', hexZeroPad('0x789', 20), {
        message,
        signature: mockValidSignature,
        safeAppId,
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.PROPOSE, {
        messageHash: '0x123',
      })
    })

    it('should normalize EIP712 messages', async () => {
      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.resolve())
      jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '5',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message: {
        types: { [type: string]: { name: string; type: string }[] }
        domain: any
        message: any
        primaryType?: string
      } = {
        types: {
          Test: [{ name: 'test', type: 'string' }],
        },
        domain: {
          chainId: '1',
          name: 'TestDapp',
          verifyingContract: hexZeroPad('0x1234', 20),
        },
        message: {
          test: 'Hello World!',
        },
      }
      const safeAppId = 1

      await dispatchSafeMsgProposal({ onboard: mockOnboard, safe, message, safeAppId })

      // Normalize message manually
      message.types['EIP712Domain'] = [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ]
      message.primaryType = 'Test'

      expect(proposeSafeMessageSpy).toHaveBeenCalledWith('5', hexZeroPad('0x789', 20), {
        message,
        signature: mockValidSignature,
        safeAppId,
      })
    })

    it('should adjust hardware wallet signatures', async () => {
      jest.spyOn(sdk, 'getAssertedChainSigner').mockResolvedValue({
        _signTypedData: jest.fn().mockImplementation(() => Promise.resolve(mockSignatureWithInvalidV)),
      } as unknown as JsonRpcSigner)

      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '5',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const safeAppId = 1

      await dispatchSafeMsgProposal({ onboard: mockOnboard, safe, message, safeAppId })

      expect(proposeSafeMessageSpy).toHaveBeenCalledWith('5', hexZeroPad('0x789', 20), {
        message,
        // Even though the mock returns the signature with invalid V, the valid signature should get dispatched as we adjust invalid Vs
        signature: mockValidSignature,
        safeAppId,
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.PROPOSE, {
        messageHash: '0x123',
      })
    })

    it('should dispatch a message proposal failure', async () => {
      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.reject(new Error('Example error')))

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '5',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const safeAppId = 1

      try {
        await dispatchSafeMsgProposal({ onboard: mockOnboard, safe, message, safeAppId })
      } catch (e) {
        expect((e as Error).message).toBe('Example error')

        expect(proposeSafeMessageSpy).toHaveBeenCalledWith('5', hexZeroPad('0x789', 20), {
          message,
          signature: mockValidSignature,
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
      const confirmSafeMessageSpy = jest.spyOn(gateway, 'confirmSafeMessage')
      confirmSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '5',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'

      await dispatchSafeMsgConfirmation({ onboard: mockOnboard, safe, message })

      expect(confirmSafeMessageSpy).toHaveBeenCalledWith('5', '0x123', {
        signature: mockValidSignature,
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.CONFIRM_PROPOSE, {
        messageHash: '0x123',
      })
    })

    it('should dispatch a message proposal failure', async () => {
      const confirmSafeMessageSpy = jest.spyOn(gateway, 'confirmSafeMessage')
      confirmSafeMessageSpy.mockImplementation(() => Promise.reject(new Error('Example error')))

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '5',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'

      try {
        await dispatchSafeMsgConfirmation({ onboard: mockOnboard, safe, message })
      } catch (e) {
        expect((e as Error).message).toBe('Example error')

        expect(confirmSafeMessageSpy).toHaveBeenCalledWith('5', '0x123', {
          signature: mockValidSignature,
        })

        expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.CONFIRM_PROPOSE_FAILED, {
          messageHash: '0x123',
          error: expect.any(Error),
        })
      }
    })
  })
})
