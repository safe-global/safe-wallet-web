import * as creationUtils from '@/components/new-safe/create/logic/index'
import { getAvailableSaltNonce } from '@/components/new-safe/create/logic/utils'
import * as walletUtils from '@/utils/wallets'
import { faker } from '@faker-js/faker'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { MockEip1193Provider } from '@/tests/mocks/providers'
import { chainBuilder } from '@/tests/builders/chains'

describe('getAvailableSaltNonce', () => {
  jest.spyOn(creationUtils, 'computeNewSafeAddress').mockReturnValue(Promise.resolve(faker.finance.ethereumAddress()))

  let mockDeployProps: DeploySafeProps

  beforeAll(() => {
    mockDeployProps = {
      safeAccountConfig: {
        threshold: 1,
        owners: [faker.finance.ethereumAddress()],
        fallbackHandler: faker.finance.ethereumAddress(),
      },
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial nonce if no contract is deployed to the computed address', async () => {
    jest.spyOn(walletUtils, 'isSmartContract').mockReturnValue(Promise.resolve(false))
    const initialNonce = faker.string.numeric()
    const mockChain = chainBuilder().build()

    const result = await getAvailableSaltNonce(
      MockEip1193Provider,
      { ...mockDeployProps, saltNonce: initialNonce },
      mockChain,
    )

    expect(result).toEqual(initialNonce)
  })

  it('should return an increased nonce if a contract is deployed to the computed address', async () => {
    jest.spyOn(walletUtils, 'isSmartContract').mockReturnValueOnce(Promise.resolve(true))
    const initialNonce = faker.string.numeric()
    const mockChain = chainBuilder().build()

    const result = await getAvailableSaltNonce(
      MockEip1193Provider,
      { ...mockDeployProps, saltNonce: initialNonce },
      mockChain,
    )

    jest.spyOn(walletUtils, 'isSmartContract').mockReturnValueOnce(Promise.resolve(false))

    const increasedNonce = (Number(initialNonce) + 1).toString()

    expect(result).toEqual(increasedNonce)
  })
})
