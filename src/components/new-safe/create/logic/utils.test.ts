import * as creationUtils from '@/components/new-safe/create/logic/index'
import { getAvailableSaltNonce } from '@/components/new-safe/create/logic/utils'
import * as web3Utils from '@/hooks/wallets/web3'
import { faker } from '@faker-js/faker'
import { BrowserProvider, type Eip1193Provider } from 'ethers'

describe('getAvailableSaltNonce', () => {
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

    const result = await getAvailableSaltNonce(mockProvider, { ...mockDeployProps, saltNonce: initialNonce })

    expect(result).toEqual(initialNonce)
  })

  it('should return an increased nonce if a contract is deployed to the computed address', async () => {
    jest.spyOn(web3Utils, 'isSmartContract').mockReturnValueOnce(Promise.resolve(true))
    const initialNonce = faker.string.numeric()

    const result = await getAvailableSaltNonce(mockProvider, { ...mockDeployProps, saltNonce: initialNonce })

    jest.spyOn(web3Utils, 'isSmartContract').mockReturnValueOnce(Promise.resolve(false))

    const increasedNonce = (Number(initialNonce) + 1).toString()

    expect(result).toEqual(increasedNonce)
  })
})
