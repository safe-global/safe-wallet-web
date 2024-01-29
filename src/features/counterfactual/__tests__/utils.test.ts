import * as creationUtils from '@/components/new-safe/create/logic'
import * as web3Utils from '@/hooks/wallets/web3'
import { getCounterfactualNonce, getUndeployedSafeInfo } from '@/features/counterfactual/utils'
import { faker } from '@faker-js/faker'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'
import { BrowserProvider, type Eip1193Provider } from 'ethers'

describe('Counterfactual utils', () => {
  describe('getCounterfactualNonce', () => {
    jest.spyOn(creationUtils, 'computeNewSafeAddress').mockReturnValue(Promise.resolve(faker.finance.ethereumAddress()))

    const mockProvider = new BrowserProvider(jest.fn() as unknown as Eip1193Provider)
    const mockDeployProps = {
      safeAccountConfig: {
        threshold: 1,
        owners: [faker.finance.ethereumAddress()],
        fallbackHandler: faker.finance.ethereumAddress(),
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return initial nonce if no contract is deployed to the computed address', async () => {
      jest.spyOn(web3Utils, 'isSmartContract').mockReturnValue(Promise.resolve(false))
      const initialNonce = faker.string.numeric()

      const result = await getCounterfactualNonce(mockProvider, { ...mockDeployProps, saltNonce: initialNonce })

      expect(result).toEqual(initialNonce)
    })

    it('should return an increased nonce if a contract is deployed to the computed address', async () => {
      jest.spyOn(web3Utils, 'isSmartContract').mockReturnValueOnce(Promise.resolve(true))
      const initialNonce = faker.string.numeric()

      const result = await getCounterfactualNonce(mockProvider, { ...mockDeployProps, saltNonce: initialNonce })

      jest.spyOn(web3Utils, 'isSmartContract').mockReturnValueOnce(Promise.resolve(false))

      const increasedNonce = (Number(initialNonce) + 1).toString()

      expect(result).toEqual(increasedNonce)
    })
  })

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
})
