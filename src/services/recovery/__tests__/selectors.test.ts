import { BigNumber } from 'ethers'
import { faker } from '@faker-js/faker'

import {
  selectDelayModifierByGuardian,
  selectRecoveryQueues,
  selectDelayModifierByTxHash,
  selectDelayModifierByAddress,
} from '../selectors'
import type { RecoveryStateItem } from '@/services/recovery/recovery-state'

describe('selectors', () => {
  describe('selectDelayModifierByGuardian', () => {
    it('should return the Delay Modifier for the given guardian', () => {
      const delayModifier1 = {
        guardians: [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
        queue: [{ timestamp: BigNumber.from(1) }],
      } as unknown as RecoveryStateItem

      const delayModifier2 = {
        guardians: [faker.finance.ethereumAddress()],
      } as unknown as RecoveryStateItem

      const delayModifier3 = {
        guardians: [faker.finance.ethereumAddress()],
      } as unknown as RecoveryStateItem

      const data = [delayModifier1, delayModifier2, delayModifier3]

      expect(selectDelayModifierByGuardian(data, delayModifier1.guardians[0])).toStrictEqual(delayModifier1)
    })
  })

  describe('selectRecoveryQueues', () => {
    it('should return all recovery queues sorted by timestamp', () => {
      const delayModifier1 = {
        queue: [{ timestamp: BigNumber.from(1) }, { timestamp: BigNumber.from(3) }],
      } as unknown as RecoveryStateItem

      const delayModifier2 = {
        queue: [{ timestamp: BigNumber.from(2) }, { timestamp: BigNumber.from(5) }],
      } as unknown as RecoveryStateItem

      const delayModifier3 = {
        queue: [{ timestamp: BigNumber.from(4) }, { timestamp: BigNumber.from(6) }],
      } as unknown as RecoveryStateItem

      const data = [delayModifier1, delayModifier2, delayModifier3]

      expect(selectRecoveryQueues(data)).toStrictEqual([
        { timestamp: BigNumber.from(1) },
        { timestamp: BigNumber.from(2) },
        { timestamp: BigNumber.from(3) },
        { timestamp: BigNumber.from(4) },
        { timestamp: BigNumber.from(5) },
        { timestamp: BigNumber.from(6) },
      ])
    })
  })

  describe('selectDelayModifierByTxHash', () => {
    it('should return the Delay Modifier for the given txHash', () => {
      const txHash = faker.string.hexadecimal()

      const delayModifier1 = {
        queue: [{ transactionHash: txHash }],
      } as unknown as RecoveryStateItem

      const delayModifier2 = {
        queue: [{ transactionHash: faker.string.hexadecimal() }],
      } as unknown as RecoveryStateItem

      const delayModifier3 = {
        queue: [{ transactionHash: faker.string.hexadecimal() }],
      } as unknown as RecoveryStateItem

      const data = [delayModifier1, delayModifier2, delayModifier3]

      expect(selectDelayModifierByTxHash(data, txHash)).toStrictEqual(delayModifier1)
    })
  })

  describe('selectDelayModifierByAddress', () => {
    it('should return the Delay Modifier for the given address', () => {
      const delayModifier1 = {
        address: faker.finance.ethereumAddress(),
      } as unknown as RecoveryStateItem

      const delayModifier2 = {
        address: faker.finance.ethereumAddress(),
      } as unknown as RecoveryStateItem

      const delayModifier3 = {
        address: faker.finance.ethereumAddress(),
      } as unknown as RecoveryStateItem

      const data = [delayModifier1, delayModifier2, delayModifier3]

      expect(selectDelayModifierByAddress(data, delayModifier3.address)).toStrictEqual(delayModifier3)
    })
  })

  describe('selectDelayModifierByAddress', () => {
    it('should return the Delay Modifier for the given txHash', () => {
      const delayModifier1 = {
        address: faker.finance.ethereumAddress(),
      } as unknown as RecoveryStateItem

      const delayModifier2 = {
        address: faker.finance.ethereumAddress(),
      } as unknown as RecoveryStateItem

      const delayModifier3 = {
        address: faker.finance.ethereumAddress(),
      } as unknown as RecoveryStateItem

      const data = [delayModifier1, delayModifier2, delayModifier3]

      expect(selectDelayModifierByAddress(data, delayModifier2.address)).toStrictEqual(delayModifier2)
    })
  })
})
