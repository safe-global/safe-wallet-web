// Unit tests for the SafeWalletProvider class
import { SafeWalletProvider } from '.'

const safe = {
  safeAddress: '0x123',
  chainId: 1,
}

const appInfo = {
  id: 1,
  name: 'test',
  description: 'test',
  iconUrl: 'test',
  url: 'test',
}

describe('SafeWalletProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('wallet_switchEthereumChain', () => {
    it('should call the switchChain method when the method is wallet_switchEthereumChain', async () => {
      const switchChain = jest.fn()
      const sdk = {
        switchChain,
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await safeWalletProvider.request(
        1,
        { method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] } as any,
        {} as any,
      )

      expect(switchChain).toHaveBeenCalledWith('0x1', {})
    })

    it('should throw an error when the chain is not supported', async () => {
      const sdk = {
        switchChain: jest.fn().mockRejectedValue(new Error('Unsupported chain')),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await expect(
        safeWalletProvider.request(
          1,
          { method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] } as any,
          {} as any,
        ),
      ).resolves.toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unsupported chain',
        },
      })
    })
  })

  describe('eth_accounts', () => {
    it('should return the safe address when the method is eth_accounts', async () => {
      const sdk = {}
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(1, { method: 'eth_accounts' } as any, {} as any)

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: ['0x123'],
      })
    })
  })
  ;['net_version', 'eth_chainId'].forEach((method) => {
    describe(method, () => {
      it(`should return the chain id when the method is ${method}`, async () => {
        const sdk = {}
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const result = await safeWalletProvider.request(1, { method } as any, {} as any)

        expect(result).toEqual({
          id: 1,
          jsonrpc: '2.0',
          result: '0x1',
        })
      })
    })
  })

  describe('personal_sign', () => {
    it('should throw an error when the address is invalid', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
      }

      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await expect(
        safeWalletProvider.request(1, { method: 'personal_sign', params: ['message', '0x456'] } as any, {} as any),
      ).resolves.toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'The address or message hash is invalid',
        },
      })
    })

    it('should throw an error when the message hash is invalid', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await expect(
        safeWalletProvider.request(1, { method: 'personal_sign', params: ['message', '123'] } as any, {} as any),
      ).resolves.toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'The address or message hash is invalid',
        },
      })
    })

    it('should return an empty string when the signature is undefined', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({}),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        { method: 'personal_sign', params: ['message', '0x123'] } as any,
        {} as any,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: '0x',
      })
    })
  })

  describe('eth_sign', () => {
    it('should return the signature when the method is eth_sign', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        { method: 'eth_sign', params: ['0x123', '0x123'] } as any,
        {} as any,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: '0x123',
      })
    })

    it('should throw an error when the address is invalid', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
      }

      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await expect(
        safeWalletProvider.request(1, { method: 'eth_sign', params: ['0x456', '0x456'] } as any, {} as any),
      ).resolves.toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'The address or message hash is invalid',
        },
      })
    })

    it('should throw an error when the message hash is invalid', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
      }

      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await expect(
        safeWalletProvider.request(1, { method: 'eth_sign', params: ['0x123', 'messageHash'] } as any, {} as any),
      ).resolves.toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'The address or message hash is invalid',
        },
      })
    })

    it('should return an empty string when the signature is undefined', async () => {
      const sdk = {
        signMessage: jest.fn().mockResolvedValue({}),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        { method: 'personal_sign', params: ['0x123', '0x123'] } as any,
        {} as any,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: '0x',
      })
    })
  })
  ;['eth_signTypedData', 'eth_signTypedData_v4'].forEach((method) => {
    describe(method, () => {
      it(`should return the signature when the method is ${method}`, async () => {
        const sdk = {
          signTypedMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const result = await safeWalletProvider.request(
          1,
          {
            method,
            params: [
              '0x123',
              {
                domain: {
                  chainId: 1,
                  name: 'test',
                  version: '1',
                },
                message: {
                  test: 'test',
                },
              },
            ],
          } as any,
          {} as any,
        )

        expect(result).toEqual({
          id: 1,
          jsonrpc: '2.0',
          result: '0x123',
        })
      })

      it('should throw an error when the address is invalid', async () => {
        const sdk = {
          signTypedMessage: jest.fn().mockResolvedValue({ signature: '0x123' }),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        await expect(
          safeWalletProvider.request(1, { method, params: ['0x456', {}] } as any, {} as any),
        ).resolves.toEqual({
          id: 1,
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'The address is invalid',
          },
        })
      })

      it('should return an empty string when the signature is undefined', async () => {
        const sdk = {
          signTypedMessage: jest.fn().mockResolvedValue({}),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const result = await safeWalletProvider.request(
          1,
          {
            method,
            params: [
              '0x123',
              {
                domain: {
                  chainId: 1,
                  name: 'test',
                  version: '1',
                },
                message: {
                  test: 'test',
                },
              },
            ],
          } as any,
          {} as any,
        )

        expect(result).toEqual({
          id: 1,
          jsonrpc: '2.0',
          result: '0x',
        })
      })
    })
  })

  describe('eth_sendTransaction', () => {
    it('should return the transaction safeTxHash when the method is eth_sendTransaction', async () => {
      const sdk = {
        send: jest.fn().mockResolvedValue({ safeTxHash: '0x456' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        { method: 'eth_sendTransaction', params: [{ from: '0x123', to: '0x123', value: '0x123', gas: 1000 }] } as any,
        appInfo,
      )

      expect(sdk.send).toHaveBeenCalledWith(
        { txs: [{ from: '0x123', to: '0x123', value: '0x123', gas: 1000, data: '0x' }], params: { safeTxGas: 1000 } },
        appInfo,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: '0x456',
      })
    })

    it('should throw an error when the transaction is not signed by the safe', async () => {
      const sdk = {
        send: jest.fn().mockRejectedValue(new Error('User rejected the transaction')),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await expect(
        safeWalletProvider.request(
          1,
          { method: 'eth_sendTransaction', params: [{ from: '0x123', to: '0x123', value: '0x123' }] } as any,
          appInfo,
        ),
      ).resolves.toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'User rejected the transaction',
        },
      })
    })

    it('should format the gas when it is passed as a hex-encoded string', async () => {
      const sdk = {
        send: jest.fn().mockResolvedValue({ safeTxHash: '0x456' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        {
          method: 'eth_sendTransaction',
          params: [
            {
              from: '0x123',
              to: '0x123',
              value: '0x123',
              gas: 0x3e8, // 1000
            },
          ],
        } as any,
        appInfo,
      )

      expect(sdk.send).toHaveBeenCalledWith(
        { txs: [{ from: '0x123', to: '0x123', value: '0x123', gas: 1000, data: '0x' }], params: { safeTxGas: 1000 } },
        appInfo,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: '0x456',
      })
    })
  })

  describe('eth_getTransactionByHash', () => {
    it('should return the transaction when the method is eth_getTransactionByHash', async () => {
      const sdk = {
        getBySafeTxHash: jest.fn().mockResolvedValue({ txHash: '0x777' }),
        proxy: jest.fn().mockResolvedValue({ hash: '0x999' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        { method: 'eth_getTransactionByHash', params: ['0x123'] } as any,
        appInfo,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: { hash: '0x999' },
      })
    })

    it('should send a transaction and return the transaction when it is in the submitted transactions', async () => {
      const sdk = {
        send: jest.fn().mockResolvedValue({ safeTxHash: '0x777' }),
        getBySafeTxHash: jest.fn().mockResolvedValue({ txHash: '0x777' }),
        proxy: jest.fn().mockResolvedValue({ hash: '0x999' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      // Send the transaction
      await safeWalletProvider.request(
        1,
        { method: 'eth_sendTransaction', params: [{ from: '0x123', to: '0x123', value: '0x123', gas: 1000 }] } as any,
        appInfo,
      )

      const result = await safeWalletProvider.request(
        1,
        { method: 'eth_getTransactionByHash', params: ['0x777'] } as any,
        appInfo,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: {
          blockHash: null,
          blockNumber: null,
          from: '0x123',
          gas: 0,
          gasPrice: '0x00',
          hash: '0x777',
          input: '0x',
          nonce: 0,
          to: '0x123',
          transactionIndex: null,
          value: '0x123',
        },
      })
    })
  })

  describe('eth_getTransactionReceipt', () => {
    it('should return the transaction receipt when the method is eth_getTransactionReceipt', async () => {
      const sdk = {
        getBySafeTxHash: jest.fn().mockResolvedValue({ txHash: '0x777' }),
        proxy: jest.fn().mockResolvedValue({ hash: '0x999' }),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      const result = await safeWalletProvider.request(
        1,
        { method: 'eth_getTransactionReceipt', params: ['0x123'] } as any,
        appInfo,
      )

      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: { hash: '0x999' },
      })
    })
  })

  describe('proxy', () => {
    it('should default to using the proxy if the method is not supported by the provider', async () => {
      const sdk = {
        proxy: jest.fn(),
      }
      const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

      await safeWalletProvider.request(1, { method: 'web3_clientVersion', params: [''] } as any, appInfo)

      expect(sdk.proxy).toHaveBeenCalledWith('web3_clientVersion', [''])
    })
  })

  describe('EIP-5792', () => {
    describe('wallet_sendFunctionCallBundle', () => {
      it('should send a bundle', async () => {
        const sdk = {
          send: jest.fn(),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const params = [
          {
            chainId: 1,
            from: '0x1234',
            calls: [
              { gas: 1000, data: '0x123', to: '0x123', value: '0x123' },
              { gas: 1000, data: '0x456', to: '0x789', value: '0x1' },
            ],
          },
        ]

        await safeWalletProvider.request(1, { method: 'wallet_sendFunctionCallBundle', params } as any, appInfo)

        expect(sdk.send).toHaveBeenCalledWith(
          {
            txs: params[0].calls,
            params: { safeTxGas: 0 },
          },
          {
            description: 'test',
            iconUrl: 'test',
            id: 1,
            name: 'test',
            url: 'test',
          },
        )
      })
    })

    describe('wallet_getBundleStatus', () => {
      it('should look up a tx by txHash', async () => {
        const sdk = {
          getBySafeTxHash: jest.fn().mockResolvedValue({
            txStatus: 'AWAITING_EXECUTION',
            txHash: '0x123',
            txData: {
              dataDecoded: {
                parameters: [{ valueDecoded: [1] }],
              },
            },
          }),
          proxy: jest.fn(),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const params = ['0x123']

        await safeWalletProvider.request(1, { method: 'wallet_getBundleStatus', params } as any, appInfo)

        expect(sdk.getBySafeTxHash).toHaveBeenCalledWith(params[0])
        expect(sdk.proxy).toHaveBeenCalledWith('eth_getTransactionReceipt', params)
      })

      it('should return a pending status w/o txHash', async () => {
        const sdk = {
          getBySafeTxHash: jest.fn().mockResolvedValue({
            txStatus: 'AWAITING_CONFIRMATION',
            txData: {
              dataDecoded: {
                parameters: [{ valueDecoded: [1] }],
              },
            },
          }),
          proxy: jest.fn(),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const params = ['0x123']

        await safeWalletProvider.request(1, { method: 'wallet_getBundleStatus', params } as any, appInfo)

        expect(sdk.getBySafeTxHash).toHaveBeenCalledWith(params[0])
        expect(sdk.proxy).not.toHaveBeenCalled()
      })
    })

    describe('wallet_showBundleStatus', () => {
      it('should return the bundle status', async () => {
        const sdk = {
          showTxStatus: jest.fn(),
        }
        const safeWalletProvider = new SafeWalletProvider(safe, sdk as any)

        const params = ['0x123']

        await safeWalletProvider.request(1, { method: 'wallet_showBundleStatus', params } as any, appInfo)

        expect(sdk.showTxStatus).toHaveBeenCalledWith(params[0])
      })
    })
  })
})
