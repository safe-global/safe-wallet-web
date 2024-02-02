import { getCounterfactualBalance, getUndeployedSafeInfo } from '@/features/counterfactual/utils'
import { chainBuilder } from '@/tests/builders/chains'
import { faker } from '@faker-js/faker'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { BrowserProvider, type Eip1193Provider } from 'ethers'

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

    it('should return undefined if there is no provider', () => {
      const mockSafeAddress = faker.finance.ethereumAddress()
      const mockChain = chainBuilder().build()
      const result = getCounterfactualBalance(mockSafeAddress, undefined, mockChain)

      expect(result).resolves.toBeUndefined()
    })

    it('should return undefined if there is no chain info', () => {
      const mockSafeAddress = faker.finance.ethereumAddress()
      const mockProvider = new BrowserProvider(jest.fn() as unknown as Eip1193Provider)
      mockProvider.getBalance = jest.fn(() => Promise.resolve(1n))

      const result = getCounterfactualBalance(mockSafeAddress, mockProvider, undefined)

      expect(result).resolves.toBeUndefined()
    })

    it('should return the native balance', () => {
      const mockSafeAddress = faker.finance.ethereumAddress()
      const mockProvider = new BrowserProvider(jest.fn() as unknown as Eip1193Provider)
      const mockChain = chainBuilder().build()
      const mockBalance = 1000000n

      mockProvider.getBalance = jest.fn(() => Promise.resolve(mockBalance))

      const result = getCounterfactualBalance(mockSafeAddress, mockProvider, mockChain)

      expect(result).resolves.toEqual({
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
