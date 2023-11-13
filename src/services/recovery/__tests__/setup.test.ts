import { getModuleInstance, KnownContracts, deployAndSetUpModule } from '@gnosis.pm/zodiac'
import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'
import type { Web3Provider } from '@ethersproject/providers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { getRecoverySetup } from '@/services/recovery/setup'

jest.mock('@gnosis.pm/zodiac', () => ({
  ...jest.requireActual('@gnosis.pm/zodiac'),
  getModuleInstance: jest.fn(),
  deployAndSetUpModule: jest.fn(),
}))

const mockGetModuleInstance = getModuleInstance as jest.MockedFunction<typeof getModuleInstance>
const mockDeployAndSetUpModule = deployAndSetUpModule as jest.MockedFunction<typeof deployAndSetUpModule>

describe('getRecoverySetup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should deploy Delay Modifier, enable it on Safe and add a Guardian', () => {
    const txCooldown = faker.string.numeric()
    const txExpiration = faker.string.numeric()
    const guardians = [faker.finance.ethereumAddress()]
    const safeAddress = faker.finance.ethereumAddress()
    const chainId = faker.string.numeric()
    const safe = {
      address: {
        value: safeAddress,
      },
      chainId,
    } as SafeInfo
    const provider = {} as Web3Provider

    const expectedModuleAddress = faker.finance.ethereumAddress()
    const deployDelayModifierTx = {
      to: faker.finance.ethereumAddress(),
      data: faker.string.hexadecimal(),
      value: BigNumber.from(0),
    }
    mockGetModuleInstance.mockReturnValue({
      interface: {
        encodeFunctionData: jest.fn().mockReturnValue(deployDelayModifierTx.data),
      },
    } as any)
    mockDeployAndSetUpModule.mockReturnValue({
      expectedModuleAddress,
      transaction: deployDelayModifierTx,
    })

    const result = getRecoverySetup({
      txCooldown,
      txExpiration,
      guardians,
      safe,
      provider,
    })

    expect(mockDeployAndSetUpModule).toHaveBeenCalledTimes(1)
    expect(mockDeployAndSetUpModule).toHaveBeenCalledWith(
      KnownContracts.DELAY,
      {
        types: ['address', 'address', 'address', 'uint256', 'uint256'],
        values: [
          safeAddress, // address _owner
          safeAddress, // address _avatar
          safeAddress, // address _target
          txCooldown, // uint256 _cooldown
          txExpiration, // uint256 _expiration
        ],
      },
      provider,
      Number(safe.chainId),
      expect.any(String),
    )

    expect(result.expectedModuleAddress).toEqual(expectedModuleAddress)
    expect(result.transactions).toHaveLength(3)

    // Deploy Delay Modifier
    expect(result.transactions[0]).toEqual({
      ...deployDelayModifierTx,
      value: '0',
    })
    // Enable Delay Modifier on Safe
    expect(result.transactions[1]).toEqual({
      to: safeAddress,
      data: expect.any(String),
      value: '0',
    })
    // Add guardian to Delay Modifier
    expect(result.transactions[2]).toEqual({
      to: expectedModuleAddress,
      data: expect.any(String),
      value: '0',
    })
  })
})
