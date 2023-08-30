import { hexZeroPad } from 'ethers/lib/utils'
import type { ChainInfo, TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { _parseWebhookNotification } from '.'
import { WebhookType } from './webhooks'
import type {
  ConfirmationRequestEvent,
  ExecutedMultisigTransactionEvent,
  IncomingEtherEvent,
  IncomingTokenEvent,
  ModuleTransactionEvent,
  NewConfirmationEvent,
  OutgoingEtherEvent,
  OutgoingTokenEvent,
  PendingMultisigTransactionEvent,
  SafeCreatedEvent,
} from './webhooks'

const setupFetchStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}

Object.defineProperty(self, 'location', {
  value: {
    origin: 'https://app.safe.global',
  },
})

describe('parseWebhookNotification', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('should parse NEW_CONFIRMATION payloads', () => {
    const payload: NewConfirmationEvent = {
      type: WebhookType.NEW_CONFIRMATION,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      owner: hexZeroPad('0x2', 20),
      safeTxHash: hexZeroPad('0x3', 32),
    }

    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementation(
        setupFetchStub({
          results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
        }),
      )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'New confirmation',
        body: 'Safe 0x0000...0001 on Mainnet has a new confirmation from 0x0000...0002 on transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/tx?safe=eth:0x0000000000000000000000000000000000000001&id=0x0000000000000000000000000000000000000000000000000000000000000003',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'New confirmation',
        body: 'Safe 0x0000...0001 on chain 1 has a new confirmation from 0x0000...0002 on transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse EXECUTED_MULTISIG_TRANSACTION payloads', () => {
    const payload: Omit<ExecutedMultisigTransactionEvent, 'failed'> = {
      type: WebhookType.EXECUTED_MULTISIG_TRANSACTION,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      safeTxHash: hexZeroPad('0x3', 32),
      txHash: hexZeroPad('0x4', 32),
    }

    describe('successful transactions', () => {
      it('with chain info', async () => {
        global.fetch = jest.fn().mockImplementation(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )

        const notification = await _parseWebhookNotification({
          ...payload,
          failed: 'false',
        })

        expect(notification).toEqual({
          title: 'Transaction executed',
          body: 'Safe 0x0000...0001 on Mainnet executed transaction 0x0000...0004.',
          link: 'https://app.safe.global/transactions/tx?safe=eth:0x0000000000000000000000000000000000000001&id=0x0000000000000000000000000000000000000000000000000000000000000003',
        })
      })

      it('without chain info', async () => {
        global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

        const notification = await _parseWebhookNotification({
          ...payload,
          failed: 'false',
        })

        expect(notification).toEqual({
          title: 'Transaction executed',
          body: 'Safe 0x0000...0001 on chain 1 executed transaction 0x0000...0004.',
          link: 'https://app.safe.global',
        })
      })
    })

    describe('failed transactions', () => {
      it('with chain info', async () => {
        global.fetch = jest.fn().mockImplementation(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )

        const notification = await _parseWebhookNotification({
          ...payload,
          failed: 'true',
        })

        expect(notification).toEqual({
          title: 'Transaction failed',
          body: 'Safe 0x0000...0001 on Mainnet failed to execute transaction 0x0000...0004.',
          link: 'https://app.safe.global/transactions/tx?safe=eth:0x0000000000000000000000000000000000000001&id=0x0000000000000000000000000000000000000000000000000000000000000003',
        })
      })

      it('without chain info', async () => {
        global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

        const notification = await _parseWebhookNotification({
          ...payload,
          failed: 'true',
        })

        expect(notification).toEqual({
          title: 'Transaction failed',
          body: 'Safe 0x0000...0001 on chain 1 failed to execute transaction 0x0000...0004.',
          link: 'https://app.safe.global',
        })
      })
    })
  })

  describe('should parse PENDING_MULTISIG_TRANSACTION payloads', () => {
    const payload: PendingMultisigTransactionEvent = {
      type: WebhookType.PENDING_MULTISIG_TRANSACTION,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      safeTxHash: hexZeroPad('0x3', 32),
    }

    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementation(
        setupFetchStub({
          results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
        }),
      )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'New pending transaction',
        body: 'Safe 0x0000...0001 on Mainnet has a new pending transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/tx?safe=eth:0x0000000000000000000000000000000000000001&id=0x0000000000000000000000000000000000000000000000000000000000000003',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'New pending transaction',
        body: 'Safe 0x0000...0001 on chain 1 has a new pending transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse INCOMING_ETHER payloads', () => {
    const payload: IncomingEtherEvent = {
      type: WebhookType.INCOMING_ETHER,
      chainId: '137',
      address: hexZeroPad('0x1', 20),
      txHash: hexZeroPad('0x3', 32),
      value: '1000000000000000000',
    }

    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(
        setupFetchStub({
          results: [
            {
              chainName: 'Polygon',
              chainId: payload.chainId,
              shortName: 'matic',
              nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
            } as ChainInfo,
          ],
        }),
      )
      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Matic received',
        body: 'Safe 0x0000...0001 on Polygon received 1.0 MATIC in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=matic:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Ether received',
        body: 'Safe 0x0000...0001 on chain 137 received 1.0 ETH in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse OUTGOING_ETHER payloads', () => {
    const payload: OutgoingEtherEvent = {
      type: WebhookType.OUTGOING_ETHER,
      chainId: '137',
      address: hexZeroPad('0x1', 20),
      txHash: hexZeroPad('0x3', 32),
      value: '1000000000000000000',
    }

    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(
        setupFetchStub({
          results: [
            {
              chainName: 'Polygon',
              chainId: payload.chainId,
              shortName: 'matic',
              nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
            } as ChainInfo,
          ],
        }),
      )
      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Matic sent',
        body: 'Safe 0x0000...0001 on Polygon sent 1.0 MATIC in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=matic:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain info', async () => {
      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Ether sent',
        body: 'Safe 0x0000...0001 on chain 137 sent 1.0 ETH in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse INCOMING_TOKEN payloads', () => {
    const payload: IncomingTokenEvent = {
      type: WebhookType.INCOMING_TOKEN,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      tokenAddress: hexZeroPad('0x2', 20),
      txHash: hexZeroPad('0x3', 32),
    }

    const erc20Payload: IncomingTokenEvent = {
      ...payload,
      value: '1000000000000000000',
    }

    it('with chain and token info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Fake received',
        body: 'Safe 0x0000...0001 on Mainnet received some FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Fake received',
        body: 'Safe 0x0000...0001 on Mainnet received 1.0 FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Fake received',
        body: 'Safe 0x0000...0001 on chain 1 received some FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Fake received',
        body: 'Safe 0x0000...0001 on chain 1 received 1.0 FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })

    it('without token info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Token received',
        body: 'Safe 0x0000...0001 on Mainnet received some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Token received',
        body: 'Safe 0x0000...0001 on Mainnet received some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain and balance info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Token received',
        body: 'Safe 0x0000...0001 on chain 1 received some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Token received',
        body: 'Safe 0x0000...0001 on chain 1 received some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse OUTGOING_TOKEN payloads', () => {
    const payload: OutgoingTokenEvent = {
      type: WebhookType.OUTGOING_TOKEN,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      tokenAddress: hexZeroPad('0x2', 20),
      txHash: hexZeroPad('0x3', 32),
    }

    const erc20Payload: OutgoingTokenEvent = {
      ...payload,
      value: '1000000000000000000',
    }

    it('with chain and token info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Fake sent',
        body: 'Safe 0x0000...0001 on Mainnet sent some FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Fake sent',
        body: 'Safe 0x0000...0001 on Mainnet sent 1.0 FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })
    })

    it('with chain and empty token info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(
          setupFetchStub({
            items: [], // Transaction sent all of the tokens
          }),
        )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Token sent',
        body: 'Safe 0x0000...0001 on Mainnet sent some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Fake sent',
        body: 'Safe 0x0000...0001 on Mainnet sent 1.0 FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Fake sent',
        body: 'Safe 0x0000...0001 on chain 1 sent some FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(
          setupFetchStub({
            items: [
              {
                tokenInfo: {
                  address: payload.tokenAddress,
                  decimals: 18,
                  name: 'Fake',
                  symbol: 'FAKE',
                } as TokenInfo,
              },
            ],
          }),
        )

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Fake sent',
        body: 'Safe 0x0000...0001 on chain 1 sent 1.0 FAKE in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
    it('without token info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Token sent',
        body: 'Safe 0x0000...0001 on Mainnet sent some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(
          setupFetchStub({
            results: [{ chainName: 'Mainnet', chainId: payload.chainId, shortName: 'eth' } as ChainInfo],
          }),
        )
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Token sent',
        body: 'Safe 0x0000...0001 on Mainnet sent some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain and balance info', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Token sent',
        body: 'Safe 0x0000...0001 on chain 1 sent some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject()) // chains
        .mockImplementationOnce(() => Promise.reject()) // tokens

      const erc20Notification = await _parseWebhookNotification(erc20Payload)

      expect(erc20Notification).toEqual({
        title: 'Token sent',
        body: 'Safe 0x0000...0001 on chain 1 sent some tokens in transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse MODULE_TRANSACTION payloads', () => {
    const payload: ModuleTransactionEvent = {
      type: WebhookType.MODULE_TRANSACTION,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      module: hexZeroPad('0x2', 20),
      txHash: hexZeroPad('0x3', 32),
    }

    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementation(
        setupFetchStub({
          results: [{ chainName: 'Mainnet', chainId: '1', shortName: 'eth' } as ChainInfo],
        }),
      )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Module transaction',
        body: 'Safe 0x0000...0001 on Mainnet executed a module transaction 0x0000...0003 from module 0x0000...0002.',
        link: 'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Module transaction',
        body: 'Safe 0x0000...0001 on chain 1 executed a module transaction 0x0000...0003 from module 0x0000...0002.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should parse CONFIRMATION_REQUEST payloads', () => {
    const payload: ConfirmationRequestEvent = {
      type: WebhookType.CONFIRMATION_REQUEST,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      safeTxHash: hexZeroPad('0x3', 32),
    }

    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementation(
        setupFetchStub({
          results: [{ chainName: 'Mainnet', chainId: '1', shortName: 'eth' } as ChainInfo],
        }),
      )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Confirmation request',
        body: 'Safe 0x0000...0001 on Mainnet has a new confirmation request for transaction 0x0000...0003.',
        link: 'https://app.safe.global/transactions/tx?safe=eth:0x0000000000000000000000000000000000000001&id=0x0000000000000000000000000000000000000000000000000000000000000003',
      })
    })

    it('without chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toEqual({
        title: 'Confirmation request',
        body: 'Safe 0x0000...0001 on chain 1 has a new confirmation request for transaction 0x0000...0003.',
        link: 'https://app.safe.global',
      })
    })
  })

  describe('should not parse SAFE_CREATED payloads', () => {
    const payload: SafeCreatedEvent = {
      type: WebhookType.SAFE_CREATED,
      chainId: '1',
      address: hexZeroPad('0x1', 20),
      txHash: hexZeroPad('0x3', 32),
      blockNumber: '1',
    }
    it('with chain info', async () => {
      global.fetch = jest.fn().mockImplementation(
        setupFetchStub({
          results: [{ chainName: 'Mainnet', chainId: '1', shortName: 'eth' } as ChainInfo],
        }),
      )

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toBe(undefined)
    })

    it('without chain info', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject()) // chains

      const notification = await _parseWebhookNotification(payload)

      expect(notification).toBe(undefined)
    })
  })
})
