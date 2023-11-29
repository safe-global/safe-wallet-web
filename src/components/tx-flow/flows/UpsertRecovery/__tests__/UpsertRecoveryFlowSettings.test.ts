import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'

import { _isSameSetup } from '../UpsertRecoveryFlowSettings'

describe('UpsertRecoveryFlowSettings', () => {
  describe('isSameSetup', () => {
    it('should return true if the Guardian, cooldown and expiration are the same', () => {
      const oldGuardian = faker.finance.ethereumAddress()
      const oldTxCooldown = BigNumber.from(faker.number.int())
      const oldTxExpiration = BigNumber.from(faker.number.int())

      expect(
        _isSameSetup({
          oldGuardian,
          oldTxCooldown,
          oldTxExpiration,
          newGuardian: oldGuardian,
          newTxCooldown: oldTxCooldown.toString(),
          newTxExpiration: oldTxExpiration.toString(),
        }),
      ).toBe(true)
    })

    it('should return false if the Guardian is different, but the cooldown and expiration are the same', () => {
      const oldGuardian = faker.finance.ethereumAddress()
      const oldTxCooldown = BigNumber.from(faker.number.int())
      const oldTxExpiration = BigNumber.from(faker.number.int())

      const newGuardian = faker.finance.ethereumAddress()

      expect(
        _isSameSetup({
          oldGuardian,
          oldTxCooldown,
          oldTxExpiration,
          newGuardian,
          newTxCooldown: oldTxCooldown.toString(),
          newTxExpiration: oldTxExpiration.toString(),
        }),
      ).toBe(false)
    })

    it('should return false if the cooldown is different, but the Guardian and expiration are the same', () => {
      const oldGuardian = faker.finance.ethereumAddress()
      const oldTxCooldown = BigNumber.from(faker.number.int())
      const oldTxExpiration = BigNumber.from(faker.number.int())

      const newTxCooldown = faker.string.numeric({ exclude: oldTxCooldown.toString() })

      expect(
        _isSameSetup({
          oldGuardian,
          oldTxCooldown,
          oldTxExpiration,
          newGuardian: oldGuardian,
          newTxCooldown,
          newTxExpiration: oldTxExpiration.toString(),
        }),
      ).toBe(false)
    })

    it('should return false if the expiration is different, but the Guardian and cooldown are the same', () => {
      const oldGuardian = faker.finance.ethereumAddress()
      const oldTxCooldown = BigNumber.from(faker.number.int())
      const oldTxExpiration = BigNumber.from(faker.number.int())

      const newTxExpiration = faker.string.numeric({ exclude: oldTxExpiration.toString() })

      expect(
        _isSameSetup({
          oldGuardian,
          oldTxCooldown,
          oldTxExpiration,
          newGuardian: oldGuardian,
          newTxCooldown: oldTxCooldown.toString(),
          newTxExpiration,
        }),
      ).toBe(false)
    })
  })
})
