import { getModuleInstance, KnownContracts, deployAndSetUpModule } from '@gnosis.pm/zodiac'
import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import type { Web3Provider } from '@ethersproject/providers'

import { _getEditRecoveryTransactions, _getRecoverySetupTransactions } from '@/services/recovery/setup'

jest.mock('@gnosis.pm/zodiac', () => ({
  ...jest.requireActual('@gnosis.pm/zodiac'),
  getModuleInstance: jest.fn(),
  deployAndSetUpModule: jest.fn(),
}))

const mockGetModuleInstance = getModuleInstance as jest.MockedFunction<typeof getModuleInstance>
const mockDeployAndSetUpModule = deployAndSetUpModule as jest.MockedFunction<typeof deployAndSetUpModule>

describe('getRecoverySetupTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return deploy Delay Modifier, enable Safe recoverer and add a Recoverer transactions', () => {
    const txCooldown = faker.string.numeric()
    const txExpiration = faker.string.numeric()
    const recoverers = [faker.finance.ethereumAddress()]
    const safeAddress = faker.finance.ethereumAddress()
    const chainId = faker.string.numeric()
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

    const result = _getRecoverySetupTransactions({
      txCooldown,
      txExpiration,
      recoverers,
      chainId,
      safeAddress,
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
      Number(chainId),
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
    // Add recoverer to Delay Modifier
    expect(result.transactions[2]).toEqual({
      to: expectedModuleAddress,
      data: expect.any(String),
      value: '0',
    })
  })
})

describe('getEditRecoveryTransactions', () => {
  it('should return a setTxExpiration transaction if a new txExpiration is provided', async () => {
    const moduleAddress = faker.finance.ethereumAddress()

    const txCooldown = faker.string.numeric()
    const txExpiration = faker.string.numeric()
    const recoverers = [faker.finance.ethereumAddress()]

    const newTxExpiration = faker.string.numeric({ exclude: txExpiration })

    const mockEncodeFunctionData = jest.fn()
    mockGetModuleInstance.mockReturnValue({
      txCooldown: () => Promise.resolve(BigNumber.from(txCooldown)),
      txExpiration: () => Promise.resolve(BigNumber.from(txExpiration)),
      getModulesPaginated: () => Promise.resolve([recoverers]),
      interface: {
        encodeFunctionData: mockEncodeFunctionData.mockReturnValue('0x'),
      },
    } as any)

    const transactions = await _getEditRecoveryTransactions({
      provider: {} as Web3Provider,
      newTxCooldown: txCooldown,
      newTxExpiration,
      newRecoverers: recoverers,
      moduleAddress,
    })

    expect(transactions).toHaveLength(1)

    expect(mockEncodeFunctionData).toHaveBeenCalledTimes(1)
    expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(1, 'setTxExpiration', [newTxExpiration])

    expect(transactions[0]).toEqual({
      to: moduleAddress,
      value: '0',
      data: expect.any(String),
      operation: OperationType.Call,
    })
  })

  it('should return a setTxCooldown transaction if a new txCooldown is provided', async () => {
    const moduleAddress = faker.finance.ethereumAddress()

    const txCooldown = faker.string.numeric()
    const txExpiration = faker.string.numeric()
    const recoverers = [faker.finance.ethereumAddress()]

    const newTxCooldown = faker.string.numeric({ exclude: txCooldown })

    const mockEncodeFunctionData = jest.fn()
    mockGetModuleInstance.mockReturnValue({
      txCooldown: () => Promise.resolve(BigNumber.from(txCooldown)),
      txExpiration: () => Promise.resolve(BigNumber.from(txExpiration)),
      getModulesPaginated: () => Promise.resolve([recoverers]),
      interface: {
        encodeFunctionData: mockEncodeFunctionData.mockReturnValue('0x'),
      },
    } as any)

    const transactions = await _getEditRecoveryTransactions({
      provider: {} as Web3Provider,
      newTxCooldown,
      newTxExpiration: txExpiration,
      newRecoverers: recoverers,
      moduleAddress,
    })

    expect(transactions).toHaveLength(1)

    expect(mockEncodeFunctionData).toHaveBeenCalledTimes(1)
    expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(1, 'setTxCooldown', [newTxCooldown])

    expect(transactions[0]).toEqual({
      to: moduleAddress,
      value: '0',
      data: expect.any(String),
      operation: OperationType.Call,
    })
  })

  it('should return an enableModule transaction if a new recoverer is provided', async () => {
    const moduleAddress = faker.finance.ethereumAddress()

    const txCooldown = faker.string.numeric()
    const txExpiration = faker.string.numeric()
    const recoverers = [faker.finance.ethereumAddress()]

    const newRecoverers = [recoverers[0], faker.finance.ethereumAddress(), faker.finance.ethereumAddress()]

    const mockEncodeFunctionData = jest.fn()
    mockGetModuleInstance.mockReturnValue({
      txCooldown: () => Promise.resolve(BigNumber.from(txCooldown)),
      txExpiration: () => Promise.resolve(BigNumber.from(txExpiration)),
      getModulesPaginated: () => Promise.resolve([recoverers]),
      interface: {
        encodeFunctionData: mockEncodeFunctionData.mockReturnValue('0x'),
      },
    } as any)

    const transactions = await _getEditRecoveryTransactions({
      provider: {} as Web3Provider,
      newTxCooldown: txCooldown,
      newTxExpiration: txExpiration,
      newRecoverers,
      moduleAddress,
    })

    expect(transactions).toHaveLength(2)

    expect(mockEncodeFunctionData).toHaveBeenCalledTimes(2)

    expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(1, 'enableModule', [newRecoverers[1]])
    expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(2, 'enableModule', [newRecoverers[2]])

    expect(transactions[0]).toEqual({
      to: moduleAddress,
      value: '0',
      data: expect.any(String),
      operation: OperationType.Call,
    })
    expect(transactions[1]).toEqual({
      to: moduleAddress,
      value: '0',
      data: expect.any(String),
      operation: OperationType.Call,
    })
  })

  it('should return a disableModule transaction if an existing recoverer is provided', async () => {
    const moduleAddress = faker.finance.ethereumAddress()

    const txCooldown = faker.string.numeric()
    const txExpiration = faker.string.numeric()
    const recoverers = [faker.finance.ethereumAddress()]

    const mockEncodeFunctionData = jest.fn()
    mockGetModuleInstance.mockReturnValue({
      txCooldown: () => Promise.resolve(BigNumber.from(txCooldown)),
      txExpiration: () => Promise.resolve(BigNumber.from(txExpiration)),
      getModulesPaginated: () => Promise.resolve([recoverers]),
      interface: {
        encodeFunctionData: mockEncodeFunctionData.mockReturnValue('0x'),
      },
    } as any)

    const transactions = await _getEditRecoveryTransactions({
      provider: {} as Web3Provider,
      newTxCooldown: txCooldown,
      newTxExpiration: txExpiration,
      newRecoverers: [],
      moduleAddress,
    })

    expect(transactions).toHaveLength(1)

    expect(mockEncodeFunctionData).toHaveBeenCalledTimes(1)

    expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(1, 'disableModule', [SENTINEL_ADDRESS, recoverers[0]])

    expect(transactions[0]).toEqual({
      to: moduleAddress,
      value: '0',
      data: expect.any(String),
      operation: OperationType.Call,
    })
  })

  describe('existing recoverers', () => {
    it('should skip existing recoverers provided', async () => {
      const moduleAddress = faker.finance.ethereumAddress()

      const txCooldown = faker.string.numeric()
      const txExpiration = faker.string.numeric()
      const recoverers = [faker.finance.ethereumAddress()]

      const newTxCooldown = faker.string.numeric({ exclude: txCooldown })
      const newTxExpiration = faker.string.numeric({ exclude: txExpiration })
      const newRecoverers = [recoverers[0], faker.finance.ethereumAddress()]

      const mockEncodeFunctionData = jest.fn()
      mockGetModuleInstance.mockReturnValue({
        txCooldown: () => Promise.resolve(BigNumber.from(txCooldown)),
        txExpiration: () => Promise.resolve(BigNumber.from(txExpiration)),
        getModulesPaginated: () => Promise.resolve([recoverers]),
        interface: {
          encodeFunctionData: mockEncodeFunctionData.mockReturnValue('0x'),
        },
      } as any)

      const transactions = await _getEditRecoveryTransactions({
        provider: {} as Web3Provider,
        newTxCooldown,
        newTxExpiration,
        newRecoverers,
        moduleAddress,
      })

      expect(transactions).toHaveLength(3)

      expect(mockEncodeFunctionData).toHaveBeenCalledTimes(3)

      expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(1, 'setTxCooldown', [newTxCooldown])
      expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(2, 'setTxExpiration', [newTxExpiration])
      expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(3, 'enableModule', [newRecoverers[1]]) // Skip existing recoverer

      expect(transactions[0]).toEqual({
        to: moduleAddress,
        value: '0',
        data: expect.any(String),
        operation: OperationType.Call,
      })
      expect(transactions[1]).toEqual({
        to: moduleAddress,
        value: '0',
        data: expect.any(String),
        operation: OperationType.Call,
      })
      expect(transactions[2]).toEqual({
        to: moduleAddress,
        value: '0',
        data: expect.any(String),
        operation: OperationType.Call,
      })
    })

    it('should handle complex recoverer mappings', async () => {
      const moduleAddress = faker.finance.ethereumAddress()

      const txCooldown = faker.string.numeric()
      const txExpiration = faker.string.numeric()
      const recoverers = [
        faker.finance.ethereumAddress(),
        faker.finance.ethereumAddress(),
        faker.finance.ethereumAddress(),
      ]

      const newRecoverers = [recoverers[0], faker.finance.ethereumAddress(), recoverers[1]]

      const mockEncodeFunctionData = jest.fn()
      mockGetModuleInstance.mockReturnValue({
        txCooldown: () => Promise.resolve(BigNumber.from(txCooldown)),
        txExpiration: () => Promise.resolve(BigNumber.from(txExpiration)),
        getModulesPaginated: () => Promise.resolve([recoverers]),
        interface: {
          encodeFunctionData: mockEncodeFunctionData.mockReturnValue('0x'),
        },
      } as any)

      const transactions = await _getEditRecoveryTransactions({
        provider: {} as Web3Provider,
        newTxCooldown: txCooldown,
        newTxExpiration: txExpiration,
        newRecoverers,
        moduleAddress,
      })

      expect(transactions).toHaveLength(2)

      expect(mockEncodeFunctionData).toHaveBeenCalledTimes(2)

      expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(1, 'disableModule', [recoverers[1], recoverers[2]])
      expect(mockEncodeFunctionData).toHaveBeenNthCalledWith(2, 'enableModule', [newRecoverers[1]])

      expect(transactions[0]).toEqual({
        to: moduleAddress,
        value: '0',
        data: expect.any(String),
        operation: OperationType.Call,
      })
      expect(transactions[1]).toEqual({
        to: moduleAddress,
        value: '0',
        data: expect.any(String),
        operation: OperationType.Call,
      })
    })
  })
})
