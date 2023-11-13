import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'
import type { Delay, TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import { getRecoveryState, _getQueuedTransactionsAdded, _getRecoveryQueueItem } from '../recovery-state'

describe('recovery-state', () => {
  describe('getQueuedTransactionsAdded', () => {
    it('should filter queued transactions with queueNonce >= current txNonce', () => {
      const transactionsAdded = [
        {
          args: {
            queueNonce: BigNumber.from(1),
          },
        } as unknown,
        {
          args: {
            queueNonce: BigNumber.from(2),
          },
        } as unknown,
        {
          args: {
            queueNonce: BigNumber.from(3),
          },
        } as unknown,
      ] as Array<TransactionAddedEvent>

      const txNonce = BigNumber.from(2)

      expect(_getQueuedTransactionsAdded(transactionsAdded, txNonce)).toStrictEqual([
        {
          args: {
            queueNonce: BigNumber.from(2),
          },
        } as unknown,
        {
          args: {
            queueNonce: BigNumber.from(3),
          },
        },
      ])
    })
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

  describe('getRecoveryState', () => {
    it('should return the recovery state', async () => {
      const modules = [faker.finance.ethereumAddress()]
      const txExpiration = BigNumber.from(0)
      const txCooldown = BigNumber.from(69420)
      const txNonce = BigNumber.from(2)
      const queueNonce = BigNumber.from(3)
      const transactionsAdded = [
        {
          getBlock: () => Promise.resolve({ timestamp: 69 }),
          args: {
            queueNonce: BigNumber.from(1),
          },
        } as unknown,
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

      const delayModifier = {
        filters: {
          TransactionAdded: () => ({}),
        },
        address: faker.finance.ethereumAddress(),
        getModulesPaginated: () => Promise.resolve([modules]),
        txExpiration: () => Promise.resolve(txExpiration),
        txCooldown: () => Promise.resolve(txCooldown),
        txNonce: () => Promise.resolve(txNonce),
        queueNonce: () => Promise.resolve(queueNonce),
        queryFilter: () => Promise.resolve(transactionsAdded),
      }

      const recoveryState = await getRecoveryState(delayModifier as unknown as Delay)

      expect(recoveryState).toStrictEqual({
        address: delayModifier.address,
        modules,
        txExpiration,
        txCooldown,
        txNonce,
        queueNonce,
        queue: [
          {
            ...transactionsAdded[1],
            timestamp: 420,
            validFrom: BigNumber.from(420).add(txCooldown),
            expiresAt: null,
          },
          {
            ...transactionsAdded[2],
            timestamp: 69420,
            validFrom: BigNumber.from(69420).add(txCooldown),
            expiresAt: null,
          },
        ],
      })
    })
  })
})
