import { getCounterfactualBalance, getUndeployedSafeInfo } from '@/features/counterfactual/utils'
import * as web3 from '@/hooks/wallets/web3'
import { chainBuilder } from '@/tests/builders/chains'
import { faker } from '@faker-js/faker'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { type BrowserProvider, type JsonRpcProvider } from 'ethers'

describe('Counterfactual utils', () => {
  describe('getUndeployedSafeInfo', () => {
    it('should return undeployed safe info', async () => {
      const undeployedSafe: PredictedSafeProps = {
        safeAccountConfig: {
          owners: [faker.finance.ethereumAddress()],
          threshold: 1,
        },
        safeDeploymentConfig: {},
      }
      const mockAddress = faker.finance.ethereumAddress()
      const mockChainId = '1'

      const result = await getUndeployedSafeInfo(undeployedSafe, mockAddress, mockChainId)

      expect(result.nonce).toEqual(0)
      expect(result.deployed).toEqual(false)
      expect(result.address.value).toEqual(mockAddress)
      expect(result.chainId).toEqual(mockChainId)
      expect(result.threshold).toEqual(undeployedSafe.safeAccountConfig.threshold)
      expect(result.owners[0].value).toEqual(undeployedSafe.safeAccountConfig.owners[0])
    })
  })

  describe('getCounterfactualBalance', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should fall back to readonly provider if there is no provider', async () => {
      const mockBalance = 123n
      const mockReadOnlyProvider = {
        getBalance: jest.fn(() => Promise.resolve(mockBalance)),
      } as unknown as JsonRpcProvider
      jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => mockReadOnlyProvider)

      const mockSafeAddress = faker.finance.ethereumAddress()
      const mockChain = chainBuilder().build()
      const result = await getCounterfactualBalance(mockSafeAddress, undefined, mockChain)

      expect(mockReadOnlyProvider.getBalance).toHaveBeenCalled()
      expect(result).toEqual({
        fiatTotal: '0',
        items: [
          {
            tokenInfo: {
              type: TokenType.NATIVE_TOKEN,
              address: ZERO_ADDRESS,
              ...mockChain.nativeCurrency,
            },
            balance: mockBalance.toString(),
            fiatBalance: '0',
            fiatConversion: '0',
          },
        ],
      })
    })

    it('should return undefined if there is no chain info', async () => {
      const mockSafeAddress = faker.finance.ethereumAddress()
      const mockProvider = { getBalance: jest.fn(() => Promise.resolve(1n)) } as unknown as BrowserProvider

      const result = await getCounterfactualBalance(mockSafeAddress, mockProvider, undefined)

      expect(result).toBeUndefined()
    })

    it('should return the native balance', async () => {
      const mockSafeAddress = faker.finance.ethereumAddress()
      const mockBalance = 1000000n
      const mockProvider = { getBalance: jest.fn(() => Promise.resolve(mockBalance)) } as unknown as BrowserProvider
      const mockChain = chainBuilder().build()

      const result = await getCounterfactualBalance(mockSafeAddress, mockProvider, mockChain)

      expect(mockProvider.getBalance).toHaveBeenCalled()
      expect(result).toEqual({
        fiatTotal: '0',
        items: [
          {
            tokenInfo: {
              type: TokenType.NATIVE_TOKEN,
              address: ZERO_ADDRESS,
              ...mockChain.nativeCurrency,
            },
            balance: mockBalance.toString(),
            fiatBalance: '0',
            fiatConversion: '0',
          },
        ],
      })
    })
  })
})
