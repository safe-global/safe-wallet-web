import { type JsonRpcProvider, toBeHex } from 'ethers'

import * as web3 from '@/hooks/wallets/web3'
import { isSmartContractWallet } from '@/utils/wallets'

describe('wallets', () => {
  describe('isSmartContractWallet', () => {
    const getCodeMock = jest.fn()

    beforeEach(() => {
      // Clear memoization cache
      isSmartContractWallet.cache.clear?.()

      jest.clearAllMocks()

      jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => {
        return {
          getCode: getCodeMock,
        } as unknown as JsonRpcProvider
      })
    })

    it('should should only call the provider once per address on a chain', async () => {
      for await (const _ of Array.from({ length: 10 })) {
        await isSmartContractWallet('1', toBeHex('0x1', 20))
      }

      expect(getCodeMock).toHaveBeenCalledTimes(1)
    })

    it('should not memoize different addresses on the same chain', async () => {
      const chainId = '1'

      await isSmartContractWallet(chainId, toBeHex('0x1', 20))
      await isSmartContractWallet(chainId, toBeHex('0x2', 20))

      expect(getCodeMock).toHaveBeenCalledTimes(2)
    })

    it('should not memoize the same address on difference chains', async () => {
      for await (const i of Array.from({ length: 10 }, (_, i) => i + 1)) {
        await isSmartContractWallet(i.toString(), toBeHex('0x1', 20))
      }

      expect(getCodeMock).toHaveBeenCalledTimes(10)
    })
  })
})
