import { hexZeroPad } from 'ethers/lib/utils'
import type { ProposalTypes, SessionTypes, SignClientTypes, Verify } from '@walletconnect/types'
import type { IWeb3Wallet } from '@walletconnect/web3wallet'

import WalletConnectWallet from './WalletConnectWallet'

jest.mock('@walletconnect/core', () => ({
  Core: jest.fn(),
}))

jest.mock('@walletconnect/web3wallet', () => {
  class MockWeb3Wallet implements Partial<IWeb3Wallet> {
    static init() {
      const wallet = new MockWeb3Wallet()

      return Promise.resolve(wallet)
    }

    core = {
      pairing: {
        pair: jest.fn(),
      },
    } as unknown as IWeb3Wallet['core']

    on = jest.fn()

    off = jest.fn()

    disconnectSession = jest.fn()

    getActiveSessions = jest.fn()

    respondSessionRequest = jest.fn()

    emitSessionEvent = jest.fn()

    updateSession = jest.fn()

    approveSession = jest.fn()

    events = {
      emit: jest.fn(),
    } as unknown as IWeb3Wallet['events']
  }

  return {
    Web3Wallet: MockWeb3Wallet,
  }
})

jest.mock('@walletconnect/utils', () => {
  // TODO: Import actual utils from @walletconnect/utils in order to complete todo tests
  return {
    getSdkError: jest.fn(() => ({ message: 'error' })),
    buildApprovedNamespaces: jest.fn(() => ({})),
  }
})

describe('WalletConnectWallet', () => {
  let wallet: WalletConnectWallet

  beforeEach(async () => {
    wallet = new WalletConnectWallet()

    await wallet.init()
  })

  describe('connect', () => {
    it('should call pair with the correct parameters', async () => {
      const pairSpy = jest.spyOn(((wallet as any).web3Wallet as IWeb3Wallet).core.pairing, 'pair')

      await wallet.connect('wc:123')

      expect(pairSpy).toHaveBeenCalledWith({ uri: 'wc:123' })
    })
  })

  describe('chainChanged', () => {
    it('should call emitSessionEvent with the correct parameters', async () => {
      const emitSessionEventSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'emitSessionEvent')

      await wallet.chainChanged('topic1', '1')

      expect(emitSessionEventSpy).toHaveBeenCalledWith({
        topic: 'topic1',
        event: {
          name: 'chainChanged',
          data: 1,
        },
        chainId: 'eip155:1',
      })
    })
  })

  describe('accountsChanged', () => {
    it('should call emitSessionEvent with the correct parameters', async () => {
      const emitSessionEventSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'emitSessionEvent')

      await wallet.accountsChanged('topic1', '1', hexZeroPad('0x123', 20))

      expect(emitSessionEventSpy).toHaveBeenCalledWith({
        topic: 'topic1',
        event: {
          name: 'accountsChanged',
          data: [hexZeroPad('0x123', 20)],
        },
        chainId: 'eip155:1',
      })
    })
  })

  describe('approveSession', () => {
    it.todo('should approve the session with the correct namespace')

    it('should call emitSessionEvent with the correct parameters', async () => {
      const approveSessionSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'approveSession')
      const emitSpy = jest.spyOn(((wallet as any).web3Wallet as IWeb3Wallet).events, 'emit')

      await wallet.approveSession(
        {
          id: 1,
          params: {
            id: 1,
            expiry: 1,
            relays: [],
            proposer: {
              publicKey: '123',
              metadata: {} as SignClientTypes.Metadata,
            },
            requiredNamespaces: {} as ProposalTypes.RequiredNamespaces,
            optionalNamespaces: {} as ProposalTypes.OptionalNamespaces,
          },
          verifyContext: {} as Verify.Context,
        },
        '1',
        hexZeroPad('0x123', 20),
      )

      expect(approveSessionSpy).toHaveBeenCalled()

      expect(emitSpy).toHaveBeenCalledWith('session_add')
    })
  })

  describe('updateSession', () => {
    it.todo('should update the session with the correct namespace')

    it.todo('should not update the session if the chainId or account is already in the namespace')

    it('should call emitSessionEvent with the correct parameters', async () => {
      const updateSessionSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'updateSession')
      const emitSessionEventSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'emitSessionEvent')

      await (wallet as any).updateSession(
        {
          topic: 'topic1',
          namespaces: {},
        } as SessionTypes.Struct,
        '1',
        hexZeroPad('0x123', 20),
      )

      expect(updateSessionSpy).toHaveBeenCalled()

      expect(emitSessionEventSpy).toHaveBeenCalledWith({
        topic: 'topic1',
        event: {
          name: 'accountsChanged',
          data: [hexZeroPad('0x123', 20)],
        },
        chainId: 'eip155:1',
      })

      expect(emitSessionEventSpy).toHaveBeenCalledWith({
        topic: 'topic1',
        event: {
          name: 'chainChanged',
          data: 1,
        },
        chainId: 'eip155:1',
      })
    })
  })

  describe('updateSessions', () => {
    it('should call updateSession for each active session', async () => {
      const session1 = { topic: 'topic1', namespaces: {} } as SessionTypes.Struct
      const session2 = { topic: 'topic2', namespaces: {} } as SessionTypes.Struct
      const updateSessionSpy = jest.spyOn(wallet as any, 'updateSession')
      jest.spyOn(wallet, 'getActiveSessions').mockReturnValue([session1, session2])

      await wallet.updateSessions('1', hexZeroPad('0x123', 20))

      expect(updateSessionSpy).toHaveBeenCalledTimes(2)
      expect(updateSessionSpy).toHaveBeenCalledWith(session1, '1', hexZeroPad('0x123', 20))
      expect(updateSessionSpy).toHaveBeenCalledWith(session2, '1', hexZeroPad('0x123', 20))
    })
  })

  describe('onSessionPropose', () => {
    it('should subscribe to session_proposal event', () => {
      const onSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'on')
      const offSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'off')

      const handler = jest.fn()

      const unsubscribe = wallet.onSessionPropose(handler)

      expect(onSpy).toHaveBeenCalledWith('session_proposal', handler)
      expect(offSpy).not.toHaveBeenCalled()

      unsubscribe()

      expect(offSpy).toHaveBeenCalledWith('session_proposal', handler)
    })
  })

  describe('onSessionAdd', () => {
    it('should subscribe to SESSION_ADD_EVENT event', () => {
      const onSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'on')
      const offSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'off')

      const handler = jest.fn()

      const unsubscribe = wallet.onSessionAdd(handler)

      expect(onSpy).toHaveBeenCalledWith('session_add', handler)
      expect(offSpy).not.toHaveBeenCalled()

      unsubscribe()

      expect(offSpy).toHaveBeenCalledWith('session_add', handler)
    })
  })

  describe('onSessionDelete', () => {
    it('should subscribe to session_delete event', () => {
      const onSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'on')
      const offSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'off')

      const handler = jest.fn()

      const unsubscribe = wallet.onSessionDelete(handler)

      expect(onSpy).toHaveBeenCalledWith('session_delete', handler)
      expect(offSpy).not.toHaveBeenCalled()

      unsubscribe()

      expect(offSpy).toHaveBeenCalledWith('session_delete', handler)
    })
  })

  describe('disconnectSession', () => {
    it('should call disconnectSession with the correct parameters', async () => {
      const session = { topic: 'topic1', namespaces: {} } as SessionTypes.Struct
      const disconnectSessionSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'disconnectSession')

      await wallet.disconnectSession(session)

      expect(disconnectSessionSpy).toHaveBeenCalledWith({
        topic: 'topic1',
        reason: expect.any(Object),
      })
    })
  })

  describe('getActiveSessions', () => {
    it('should return an array of active sessions', () => {
      jest.spyOn((wallet as any).web3Wallet, 'getActiveSessions').mockReturnValue({
        topic1: { topic: 'topic1', namespaces: {} } as SessionTypes.Struct,
        topic2: { topic: 'topic2', namespaces: {} } as SessionTypes.Struct,
      })

      const activeSessions = wallet.getActiveSessions()

      expect(activeSessions).toEqual([
        { topic: 'topic1', namespaces: {} },
        { topic: 'topic2', namespaces: {} },
      ])
    })
  })

  describe('onRequest', () => {
    it('should subscribe to session_request event', () => {
      const handler = jest.fn()
      const onSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'on')
      const offSpy = jest.spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'off')

      const unsubscribe = wallet.onRequest(handler)

      expect(onSpy).toHaveBeenCalledWith('session_request', handler)
      expect(offSpy).not.toHaveBeenCalled()

      unsubscribe()

      expect(offSpy).toHaveBeenCalledWith('session_request', handler)
    })
  })

  describe('sendSessionResponse', () => {
    it('should call respondSessionRequest with the correct parameters', async () => {
      const respondSessionRequestSpy = jest
        .spyOn((wallet as any).web3Wallet as IWeb3Wallet, 'respondSessionRequest')
        .mockResolvedValue(undefined)

      await wallet.sendSessionResponse('topic1', { id: 1, jsonrpc: '2.0', result: 'result' })

      expect(respondSessionRequestSpy).toHaveBeenCalledWith({
        topic: 'topic1',
        response: { id: 1, jsonrpc: '2.0', result: 'result' },
      })
    })
  })
})
