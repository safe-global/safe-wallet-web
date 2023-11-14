import { faker } from '@faker-js/faker'
import { BigNumber, ethers } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import type { Delay, TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

import { getRecoveryState, _getRecoveryQueueItem, _getSafeCreationReceipt } from '../recovery-state'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { cloneDeep } from 'lodash'

jest.mock('@/hooks/wallets/web3')

const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>

describe('recovery-state', () => {
  beforeEach(() => {
    // Clear memoization cache
    _getSafeCreationReceipt.cache.clear?.()
  })

  describe('getRecoveryQueueItem', () => {
    it('should return a recovery queue item', async () => {
      const transactionAdded = {
        getBlock: () => Promise.resolve({ timestamp: 1 }),
      } as TransactionAddedEvent
      const txCooldown = BigNumber.from(1)
      const txExpiration = BigNumber.from(2)

      const item = await _getRecoveryQueueItem(transactionAdded, txCooldown, txExpiration)

      expect(item).toStrictEqual({
        ...transactionAdded,
        timestamp: 1,
        validFrom: BigNumber.from(2),
        expiresAt: BigNumber.from(4),
      })
    })

    it('should return a recovery queue item with expiresAt null if txExpiration is zero', async () => {
      const transactionAdded = {
        getBlock: () => Promise.resolve({ timestamp: 1 }),
      } as TransactionAddedEvent
      const txCooldown = BigNumber.from(1)
      const txExpiration = BigNumber.from(0)

      const item = await _getRecoveryQueueItem(transactionAdded, txCooldown, txExpiration)

      expect(item).toStrictEqual({
        ...transactionAdded,
        timestamp: 1,
        validFrom: BigNumber.from(2),
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
      const transactionService = faker.internet.url({ appendSlash: false })
      const transactionHash = `0x${faker.string.hexadecimal()}`
      const blockNumber = faker.number.int()
      const provider = {
        getTransactionReceipt: () => Promise.resolve({ blockNumber } as TransactionReceipt),
      } as unknown as JsonRpcProvider

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        return Promise.resolve({
          json: () => Promise.resolve({ transactionHash }),
          status: 200,
          ok: true,
        })
      })

      const modules = [faker.finance.ethereumAddress()]
      const txExpiration = BigNumber.from(0)
      const txCooldown = BigNumber.from(69420)
      const txNonce = BigNumber.from(2)
      const queueNonce = BigNumber.from(4)
      const transactionsAdded = [
        {
          getBlock: () => Promise.resolve({ timestamp: 420 }),
          args: {
            queueNonce: BigNumber.from(2),
          },
        } as unknown,
        {
          getBlock: () => Promise.resolve({ timestamp: 69420 }),
          args: {
            queueNonce: BigNumber.from(3),
          },
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
        getModulesPaginated: () => Promise.resolve([modules]),
        txExpiration: () => Promise.resolve(txExpiration),
        txCooldown: () => Promise.resolve(txCooldown),
        txNonce: () => Promise.resolve(txNonce),
        queueNonce: () => Promise.resolve(queueNonce),
        queryFilter: queryFilterMock.mockImplementation(() => Promise.resolve(transactionsAdded)),
      }

      const recoveryState = await getRecoveryState({
        delayModifier: delayModifier as unknown as Delay,
        safeAddress,
        transactionService,
        provider,
      })

      expect(recoveryState).toStrictEqual({
        address: delayModifier.address,
        modules,
        txExpiration,
        txCooldown,
        txNonce,
        queueNonce,
        queue: [
          {
            ...transactionsAdded[0],
            timestamp: 420,
            validFrom: BigNumber.from(420).add(txCooldown),
            expiresAt: null,
          },
          {
            ...transactionsAdded[1],
            timestamp: 69420,
            validFrom: BigNumber.from(69420).add(txCooldown),
            expiresAt: null,
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
        blockNumber,
        'latest',
      )
    })

    it('should not query data if the queueNonce equals the txNonce', async () => {
      const safeAddress = faker.finance.ethereumAddress()
      const transactionService = faker.internet.url({ appendSlash: true })
      const provider = {} as unknown as JsonRpcProvider

      const modules = [faker.finance.ethereumAddress()]
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
        getModulesPaginated: () => Promise.resolve([modules]),
        txExpiration: () => Promise.resolve(txExpiration),
        txCooldown: () => Promise.resolve(txCooldown),
        txNonce: () => Promise.resolve(txNonce),
        queueNonce: () => Promise.resolve(queueNonce),
        queryFilter: queryFilterMock.mockRejectedValue('Not required'),
      }

      const recoveryState = await getRecoveryState({
        delayModifier: delayModifier as unknown as Delay,
        safeAddress,
        transactionService,
        provider,
      })

      expect(recoveryState).toStrictEqual({
        address: delayModifier.address,
        modules,
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
