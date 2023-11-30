import { faker } from '@faker-js/faker'
import { BigNumber, ethers } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { cloneDeep } from 'lodash'
import type { Delay, TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

import {
  _getRecoveryStateItem,
  _getRecoveryQueueItemTimestamps,
  _getSafeCreationReceipt,
  _isMaliciousRecovery,
} from '../recovery-state'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { encodeMultiSendData } from '@safe-global/safe-core-sdk/dist/src/utils/transactions/utils'
import { getMultiSendCallOnlyDeployment, getSafeSingletonDeployment } from '@safe-global/safe-deployments'
import { Interface } from 'ethers/lib/utils'

jest.mock('@/hooks/wallets/web3')

const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>

describe('recovery-state', () => {
  beforeEach(() => {
    // Clear memoization cache
    _getSafeCreationReceipt.cache.clear?.()
  })

  describe('isMaliciousRecovery', () => {
    describe('non-MultiSend', () => {
      it('should return true if the transaction is not calling the Safe itself', () => {
        const chainId = '5'
        const version = '1.3.0'
        const safeAddress = faker.finance.ethereumAddress()

        const transaction = {
          to: faker.finance.ethereumAddress(), // Not Safe
          data: '0x',
        }

        expect(_isMaliciousRecovery({ chainId, version, safeAddress, transaction })).toBe(true)
      })

      it('should return false if the transaction is calling the Safe itself', () => {
        const chainId = '5'
        const version = '1.3.0'
        const safeAddress = faker.finance.ethereumAddress()

        const transaction = {
          to: safeAddress, // Safe
          data: '0x',
        }

        expect(_isMaliciousRecovery({ chainId, version, safeAddress, transaction })).toBe(false)
      })
    })

    describe('MultiSend', () => {
      it('should return true if the transaction is a not and official MultiSend address', () => {
        const chainId = '5'
        const version = '1.3.0'
        const safeAddress = faker.finance.ethereumAddress()

        const safeAbi = getSafeSingletonDeployment({ network: chainId, version })!.abi
        const safeInterface = new Interface(safeAbi)

        const multiSendAbi = getMultiSendCallOnlyDeployment({ network: chainId, version })!.abi
        const multiSendInterface = new Interface(multiSendAbi)

        const multiSendData = encodeMultiSendData([
          {
            to: safeAddress,
            value: '0',
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 1]),
            operation: 0,
          },
          {
            to: safeAddress,
            value: '0',
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 2]),
            operation: 0,
          },
        ])

        const transaction = {
          to: faker.finance.ethereumAddress(), // Not official MultiSend
          data: multiSendInterface.encodeFunctionData('multiSend', [multiSendData]),
        }

        expect(_isMaliciousRecovery({ chainId, version, safeAddress, transaction })).toBe(true)
      })

      it('should return true if the transaction is an official MultiSend call and not every transaction in the batch calls the Safe itself', () => {
        const chainId = '5'
        const version = '1.3.0'
        const safeAddress = faker.finance.ethereumAddress()

        const safeAbi = getSafeSingletonDeployment({ network: chainId, version })!.abi
        const safeInterface = new Interface(safeAbi)

        const multiSendDeployment = getMultiSendCallOnlyDeployment({ network: chainId, version })!
        const multiSendInterface = new Interface(multiSendDeployment.abi)

        const multiSendData = encodeMultiSendData([
          {
            to: faker.finance.ethereumAddress(), // Not Safe
            value: '0',
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 1]),
            operation: 0,
          },
          {
            to: faker.finance.ethereumAddress(), // Not Safe
            value: '0',
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 2]),
            operation: 0,
          },
        ])

        const transaction = {
          to: multiSendDeployment.networkAddresses[chainId],
          data: multiSendInterface.encodeFunctionData('multiSend', [multiSendData]),
        }

        expect(_isMaliciousRecovery({ chainId, version, safeAddress, transaction })).toBe(true)
      })

      it('should return false if the transaction is an official MultiSend call and every transaction in the batch calls the Safe itself', () => {
        const chainId = '5'
        const version = '1.3.0'
        const safeAddress = faker.finance.ethereumAddress()

        const safeAbi = getSafeSingletonDeployment({ network: chainId, version })!.abi
        const safeInterface = new Interface(safeAbi)

        const multiSendDeployment = getMultiSendCallOnlyDeployment({ network: chainId, version })!
        const multiSendInterface = new Interface(multiSendDeployment.abi)

        const multiSendData = encodeMultiSendData([
          {
            to: safeAddress,
            value: '0',
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 1]),
            operation: 0,
          },
          {
            to: safeAddress,
            value: '0',
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 2]),
            operation: 0,
          },
        ])

        const transaction = {
          to: multiSendDeployment.networkAddresses[chainId],
          data: multiSendInterface.encodeFunctionData('multiSend', [multiSendData]),
        }

        expect(_isMaliciousRecovery({ chainId, version, safeAddress, transaction })).toBe(false)
      })
      ;['1.0.0', '1.1.1'].forEach((version) => {
        it(`should return false if the transaction is an official MultiSend call on Safe version ${version} (below the initial MultiSend contract version)`, () => {
          const chainId = '5'
          const safeAddress = faker.finance.ethereumAddress()

          const safeAbi = getSafeSingletonDeployment({ network: chainId, version })!.abi
          const safeInterface = new Interface(safeAbi)

          const multiSendDeployment = getMultiSendCallOnlyDeployment({ network: chainId, version: '1.3.0' })!
          const multiSendInterface = new Interface(multiSendDeployment.abi)

          const multiSendData = encodeMultiSendData([
            {
              to: safeAddress,
              value: '0',
              data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 1]),
              operation: 0,
            },
          ])

          const transaction = {
            to: multiSendDeployment.networkAddresses[chainId],
            data: multiSendInterface.encodeFunctionData('multiSend', [multiSendData]),
          }

          expect(_isMaliciousRecovery({ chainId, version, safeAddress, transaction })).toBe(false)
        })
      })
    })
  })

  describe('getRecoveryQueueItemTimestamps', () => {
    it('should return a recovery queue item timestamps', async () => {
      const delayModifier = {
        txCreatedAt: () => Promise.resolve(BigNumber.from(1)),
      } as unknown as Delay
      const transactionAdded = {
        args: {
          queueNonce: BigNumber.from(0),
        },
      } as TransactionAddedEvent
      const txCooldown = BigNumber.from(1)
      const txExpiration = BigNumber.from(2)

      const item = await _getRecoveryQueueItemTimestamps({
        delayModifier,
        transactionAdded,
        txCooldown,
        txExpiration,
      })

      expect(item).toStrictEqual({
        timestamp: BigNumber.from(1_000),
        validFrom: BigNumber.from(2_000),
        expiresAt: BigNumber.from(4_000),
      })
    })

    it('should return a recovery queue item timestamps with expiresAt null if txExpiration is zero', async () => {
      const delayModifier = {
        txCreatedAt: () => Promise.resolve(BigNumber.from(1)),
      } as unknown as Delay
      const transactionAdded = {
        args: {
          queueNonce: BigNumber.from(0),
        },
      } as TransactionAddedEvent
      const txCooldown = BigNumber.from(1)
      const txExpiration = BigNumber.from(0)

      const item = await _getRecoveryQueueItemTimestamps({
        delayModifier,
        transactionAdded,
        txCooldown,
        txExpiration,
      })

      expect(item).toStrictEqual({
        timestamp: BigNumber.from(1_000),
        validFrom: BigNumber.from(2_000),
        expiresAt: null,
      })
    })
  })

  describe('getSafeCreationReceipt', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return the Safe creation receipt', async () => {
      const transactionService = faker.internet.url({ appendSlash: false })
      const safeAddress = faker.finance.ethereumAddress()
      const transactionHash = `0x${faker.string.hexadecimal()}`
      const receipt = {
        blockHash: faker.string.alphanumeric(),
      } as TransactionReceipt

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        return Promise.resolve({
          json: () => Promise.resolve({ transactionHash }),
          status: 200,
          ok: true,
        })
      })

      const provider = {
        getTransactionReceipt: () => Promise.resolve(receipt),
      } as unknown as JsonRpcProvider
      mockUseWeb3ReadOnly.mockReturnValue(provider)

      const creationReceipt = await _getSafeCreationReceipt({
        transactionService,
        safeAddress,
        provider,
      })

      expect(receipt).toStrictEqual(creationReceipt)
    })

    it('should memoize the Safe creation receipt', async () => {
      const transactionService = faker.internet.url({ appendSlash: false })
      const safeAddress = faker.finance.ethereumAddress()
      const transactionHash = `0x${faker.string.hexadecimal()}`
      const receipt = {
        blockHash: faker.string.alphanumeric(),
      } as TransactionReceipt

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        return Promise.resolve({
          json: () => Promise.resolve({ transactionHash }),
          status: 200,
          ok: true,
        })
      })

      const provider = {
        getTransactionReceipt: () => Promise.resolve(receipt),
      } as unknown as JsonRpcProvider
      mockUseWeb3ReadOnly.mockReturnValue(provider)

      Array.from({ length: 3 }).forEach(async () => {
        await _getSafeCreationReceipt({
          transactionService,
          safeAddress,
          provider,
        })
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if the Safe creation receipt cannot be fetched', async () => {
      const transactionService = faker.internet.url({ appendSlash: false })
      const safeAddress = faker.finance.ethereumAddress()

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        return Promise.resolve({
          status: 500,
          ok: false,
        })
      })

      const provider = new JsonRpcProvider()
      mockUseWeb3ReadOnly.mockReturnValue(provider)

      expect(
        _getSafeCreationReceipt({
          transactionService,
          safeAddress,
          provider,
        }),
      ).rejects.toThrow('Error fetching Safe creation details')
    })
  })

  describe('getRecoveryState', () => {
    it('should return the recovery state from the Safe creation block', async () => {
      const safeAddress = faker.finance.ethereumAddress()
      const chainId = '5'
      const version = '1.3.0'
      const transactionService = faker.internet.url({ appendSlash: false })
      const transactionHash = `0x${faker.string.hexadecimal()}`
      const safeCreationReceipt = {
        blockNumber: faker.number.int(),
      } as TransactionReceipt
      const transactionAddedReceipt = {
        from: faker.finance.ethereumAddress(),
      } as TransactionReceipt
      const provider = {
        getTransactionReceipt: jest
          .fn()
          .mockResolvedValueOnce(safeCreationReceipt)
          .mockResolvedValue(transactionAddedReceipt),
      } as unknown as JsonRpcProvider

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        return Promise.resolve({
          json: () => Promise.resolve({ transactionHash }),
          status: 200,
          ok: true,
        })
      })

      const recoverers = [faker.finance.ethereumAddress()]
      const txExpiration = BigNumber.from(0)
      const txCooldown = BigNumber.from(69420)
      const txNonce = BigNumber.from(2)
      const queueNonce = BigNumber.from(4)
      const transactionsAdded = [
        {
          args: {
            queueNonce: BigNumber.from(2),
            to: safeAddress,
            value: BigNumber.from(0),
            data: '0x',
          },
        } as unknown,
        {
          args: {
            queueNonce: BigNumber.from(3),
            to: faker.finance.ethereumAddress(), // Malicious
            value: BigNumber.from(0),
            data: '0x',
          },
        } as unknown,
        {
          args: {
            queueNonce: BigNumber.from(4),
            to: safeAddress,
            value: BigNumber.from(0),
            data: '0x',
          },
          removed: true, // Reorg
        } as unknown,
      ] as Array<TransactionAddedEvent>

      const queryFilterMock = jest.fn()
      const defaultTransactionAddedFilter = {
        address: faker.finance.ethereumAddress(),
        topics: [ethers.utils.id('TransactionAdded(uint256,bytes32,address,uint256,bytes,uint8)')],
      }
      const delayModifier = {
        filters: {
          TransactionAdded: () => cloneDeep(defaultTransactionAddedFilter),
        },
        address: faker.finance.ethereumAddress(),
        getModulesPaginated: () => Promise.resolve([recoverers]),
        txExpiration: () => Promise.resolve(txExpiration),
        txCooldown: () => Promise.resolve(txCooldown),
        txNonce: () => Promise.resolve(txNonce),
        txCreatedAt: jest
          .fn()
          .mockResolvedValueOnce(BigNumber.from(420))
          .mockResolvedValueOnce(BigNumber.from(69420))
          .mockResolvedValueOnce(BigNumber.from(6942069)),
        queueNonce: () => Promise.resolve(queueNonce),
        queryFilter: queryFilterMock.mockImplementation(() => Promise.resolve(transactionsAdded)),
      }

      const recoveryState = await _getRecoveryStateItem({
        delayModifier: delayModifier as unknown as Delay,
        safeAddress,
        transactionService,
        provider,
        chainId,
        version,
      })

      expect(recoveryState).toStrictEqual({
        address: delayModifier.address,
        recoverers,
        txExpiration,
        txCooldown,
        txNonce,
        queueNonce,
        queue: [
          {
            ...transactionsAdded[0],
            timestamp: BigNumber.from(420).mul(1_000),
            validFrom: BigNumber.from(420).add(txCooldown).mul(1_000),
            expiresAt: null,
            isMalicious: false,
            executor: transactionAddedReceipt.from,
          },
          {
            ...transactionsAdded[1],
            timestamp: BigNumber.from(69420).mul(1_000),
            validFrom: BigNumber.from(69420).add(txCooldown).mul(1_000),
            expiresAt: null,
            isMalicious: true,
            executor: transactionAddedReceipt.from,
          },
        ],
      })
      expect(queryFilterMock).toHaveBeenCalledWith(
        {
          ...defaultTransactionAddedFilter,
          topics: [
            ...defaultTransactionAddedFilter.topics,
            [ethers.utils.hexZeroPad('0x2', 32), ethers.utils.hexZeroPad('0x3', 32)],
          ],
        },
        safeCreationReceipt.blockNumber,
        'latest',
      )
    })

    it('should not query data if the queueNonce equals the txNonce', async () => {
      const safeAddress = faker.finance.ethereumAddress()
      const chainId = '5'
      const version = '1.3.0'
      const transactionService = faker.internet.url({ appendSlash: true })
      const provider = {} as unknown as JsonRpcProvider

      const recoverers = [faker.finance.ethereumAddress()]
      const txExpiration = BigNumber.from(0)
      const txCooldown = BigNumber.from(69420)
      const txNonce = BigNumber.from(2)
      const queueNonce = BigNumber.from(2)

      const queryFilterMock = jest.fn()
      const defaultTransactionAddedFilter = {
        address: faker.finance.ethereumAddress(),
        topics: [ethers.utils.id('TransactionAdded(uint256,bytes32,address,uint256,bytes,uint8)')],
      }
      const delayModifier = {
        filters: {
          TransactionAdded: () => cloneDeep(defaultTransactionAddedFilter),
        },
        address: faker.finance.ethereumAddress(),
        getModulesPaginated: () => Promise.resolve([recoverers]),
        txExpiration: () => Promise.resolve(txExpiration),
        txCooldown: () => Promise.resolve(txCooldown),
        txNonce: () => Promise.resolve(txNonce),
        queueNonce: () => Promise.resolve(queueNonce),
        queryFilter: queryFilterMock.mockRejectedValue('Not required'),
      }

      const recoveryState = await _getRecoveryStateItem({
        delayModifier: delayModifier as unknown as Delay,
        safeAddress,
        transactionService,
        provider,
        chainId,
        version,
      })

      expect(recoveryState).toStrictEqual({
        address: delayModifier.address,
        recoverers,
        txExpiration,
        txCooldown,
        txNonce,
        queueNonce,
        queue: [],
      })
      expect(queryFilterMock).not.toHaveBeenCalled()
    })
  })
})
