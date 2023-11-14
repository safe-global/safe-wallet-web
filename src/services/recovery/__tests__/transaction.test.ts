import { faker } from '@faker-js/faker'
import { Interface } from 'ethers/lib/utils'
import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import * as deployments from '@safe-global/safe-deployments'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { getRecoveryProposalTransaction, getRecoveryProposalTransactions } from '../transaction'

describe('transaction', () => {
  describe('getRecoveryTransactions', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const encodeFunctionDataSpy = jest.spyOn(Interface.prototype, 'encodeFunctionData')

    describe('when recovering with the same number of owner(s) as the current Safe owner(s)', () => {
      describe('with unique owners', () => {
        describe('should swap all owners when the threshold remains the same', () => {
          it('for singular owners', () => {
            const safeAddresss = faker.finance.ethereumAddress()

            const oldOwner1 = faker.finance.ethereumAddress()

            const newOwner1 = faker.finance.ethereumAddress()

            const oldThreshold = 1

            const safe = {
              address: { value: safeAddresss },
              owners: [{ value: oldOwner1 }],
              threshold: oldThreshold,
            } as SafeInfo

            const newOwners = [{ value: newOwner1 }]

            const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

            expect(transactions).toHaveLength(1)

            expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(1)
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
              SENTINEL_ADDRESS,
              oldOwner1,
              newOwner1,
            ])
          })

          it('for multiple owners', () => {
            const safeAddresss = faker.finance.ethereumAddress()

            const oldOwner1 = faker.finance.ethereumAddress()
            const oldOwner2 = faker.finance.ethereumAddress()
            const oldOwner3 = faker.finance.ethereumAddress()

            const newOwner1 = faker.finance.ethereumAddress()
            const newOwner2 = faker.finance.ethereumAddress()
            const newOwner3 = faker.finance.ethereumAddress()

            const oldThreshold = 2

            const safe = {
              address: { value: safeAddresss },
              owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
              threshold: oldThreshold,
            } as SafeInfo

            const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

            const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

            expect(transactions).toHaveLength(3)

            expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
              SENTINEL_ADDRESS,
              oldOwner1,
              newOwner1,
            ])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'swapOwner', [oldOwner2, oldOwner3, newOwner3])
          })
        })

        it('should swap all owners and finally change the threshold if it changes', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()
          const oldOwner3 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()
          const newOwner2 = faker.finance.ethereumAddress()
          const newOwner3 = faker.finance.ethereumAddress()

          const oldThreshold = 2
          const newThreshold = oldThreshold + 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

          expect(transactions).toHaveLength(4)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(4)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
            SENTINEL_ADDRESS,
            oldOwner1,
            newOwner1,
          ])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'swapOwner', [oldOwner2, oldOwner3, newOwner3])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(4, 'changeThreshold', [newThreshold])
        })
      })

      describe('with duplicate owners', () => {
        describe('should swap all differing owners when the threshold remains the same', () => {
          it('for singular owners it should return nothing', () => {
            const safeAddresss = faker.finance.ethereumAddress()

            const oldOwner1 = faker.finance.ethereumAddress()

            const oldThreshold = 1

            const safe = {
              address: { value: safeAddresss },
              owners: [{ value: oldOwner1 }],
              threshold: oldThreshold,
            } as SafeInfo

            const newOwners = [{ value: oldOwner1 }]

            const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

            expect(transactions).toHaveLength(0)

            expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(0)
          })

          it('for multiple owners', () => {
            const safeAddresss = faker.finance.ethereumAddress()

            const oldOwner1 = faker.finance.ethereumAddress()
            const oldOwner2 = faker.finance.ethereumAddress()
            const oldOwner3 = faker.finance.ethereumAddress()

            const newOwner1 = faker.finance.ethereumAddress()
            const newOwner2 = faker.finance.ethereumAddress()
            const newOwner3 = oldOwner3

            const oldThreshold = 2

            const safe = {
              address: { value: safeAddresss },
              owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
              threshold: oldThreshold,
            } as SafeInfo

            const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

            const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

            expect(transactions).toHaveLength(2)

            expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(2)
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
              SENTINEL_ADDRESS,
              oldOwner1,
              newOwner1,
            ])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
          })
        })

        it('should swap all differing owners and finally change the threshold if it changes', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()
          const oldOwner3 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()
          const newOwner2 = faker.finance.ethereumAddress()

          const oldThreshold = 2
          const newThreshold = oldThreshold + 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: oldOwner3 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

          expect(transactions).toHaveLength(3)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
            SENTINEL_ADDRESS,
            oldOwner1,
            newOwner1,
          ])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'changeThreshold', [newThreshold])
        })
      })

      it('should change the threshold with the same owners', () => {
        const safeAddresss = faker.finance.ethereumAddress()

        const oldOwner1 = faker.finance.ethereumAddress()
        const oldOwner2 = faker.finance.ethereumAddress()
        const oldOwner3 = faker.finance.ethereumAddress()

        const oldThreshold = 2
        const newThreshold = 1

        const safe = {
          address: { value: safeAddresss },
          owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
          threshold: oldThreshold,
        } as SafeInfo

        const newOwners = [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }]

        const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

        expect(transactions).toHaveLength(1)

        expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(1)
        expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'changeThreshold', [newThreshold])
      })
    })

    describe('when recovering with more owner(s) than the current Safe owner(s)', () => {
      describe('with unique owners', () => {
        describe('should swap as many owners as possible then add the rest when the threshold remains the same', () => {
          it('for singular owners', () => {
            const safeAddresss = faker.finance.ethereumAddress()

            const oldOwner1 = faker.finance.ethereumAddress()

            const newOwner1 = faker.finance.ethereumAddress()
            const newOwner2 = faker.finance.ethereumAddress()
            const newOwner3 = faker.finance.ethereumAddress()

            const oldThreshold = 1

            const safe = {
              address: { value: safeAddresss },
              owners: [{ value: oldOwner1 }],
              threshold: oldThreshold,
            } as SafeInfo

            const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

            const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

            expect(transactions).toHaveLength(3)

            expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
              SENTINEL_ADDRESS,
              oldOwner1,
              newOwner1,
            ])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'addOwnerWithThreshold', [newOwner2, 1])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'addOwnerWithThreshold', [newOwner3, oldThreshold])
          })

          it('for multiple owners', () => {
            const safeAddresss = faker.finance.ethereumAddress()

            const oldOwner1 = faker.finance.ethereumAddress()
            const oldOwner2 = faker.finance.ethereumAddress()

            const newOwner1 = faker.finance.ethereumAddress()
            const newOwner2 = faker.finance.ethereumAddress()
            const newOwner3 = faker.finance.ethereumAddress()

            const oldThreshold = 1

            const safe = {
              address: { value: safeAddresss },
              owners: [{ value: oldOwner1 }, { value: oldOwner2 }],
              threshold: oldThreshold,
            } as SafeInfo

            const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

            const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

            expect(transactions).toHaveLength(3)

            expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
              SENTINEL_ADDRESS,
              oldOwner1,
              newOwner1,
            ])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'addOwnerWithThreshold', [newOwner3, oldThreshold])
          })
        })

        it('should swap as many owners as possible then add the rest when with a final threshold change if the threshold changes', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()
          const newOwner2 = faker.finance.ethereumAddress()
          const newOwner3 = faker.finance.ethereumAddress()

          const oldThreshold = 1
          const newThreshold = oldThreshold + 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

          expect(transactions).toHaveLength(3)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
            SENTINEL_ADDRESS,
            oldOwner1,
            newOwner1,
          ])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'addOwnerWithThreshold', [newOwner3, newThreshold])
        })
      })

      describe('with duplicates owners', () => {
        it('should swap as many differing owners as possible then add the rest when the threshold remains the same', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()

          const newOwner2 = faker.finance.ethereumAddress()
          const newOwner3 = faker.finance.ethereumAddress()

          const oldThreshold = 2

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: oldOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

          expect(transactions).toHaveLength(2)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(2)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'addOwnerWithThreshold', [newOwner2, 1])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'addOwnerWithThreshold', [newOwner3, oldThreshold])
        })

        it('should swap as many differing owners as possible then add the rest when with a final threshold change if the threshold changes', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()
          const newOwner2 = faker.finance.ethereumAddress()

          const oldThreshold = 2
          const newThreshold = oldThreshold + 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: oldOwner1 }, { value: newOwner1 }, { value: newOwner2 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

          expect(transactions).toHaveLength(2)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(2)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'addOwnerWithThreshold', [newOwner1, 1])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'addOwnerWithThreshold', [newOwner2, newThreshold])
        })
      })
    })

    describe('when recovering with less owner(s) than the current Safe owner(s)', () => {
      describe('with unique owners', () => {
        it('should swap as many owners as possible then remove the rest when the threshold remains the same', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()
          const oldOwner3 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()
          const newOwner2 = faker.finance.ethereumAddress()

          const oldThreshold = 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: newOwner1 }, { value: newOwner2 }]

          const transactions = getRecoveryProposalTransactions({
            safe,
            newThreshold: oldThreshold,
            newOwners,
          })

          expect(transactions).toHaveLength(3)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
            SENTINEL_ADDRESS,
            oldOwner1,
            newOwner1,
          ])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'removeOwner', [oldOwner2, oldOwner3, oldThreshold])
        })

        it('should swap as many owners as possible then remove the rest when with a final threshold change if the threshold changes', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()
          const oldOwner3 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()
          const newOwner2 = faker.finance.ethereumAddress()

          const oldThreshold = 1
          const newThreshold = oldThreshold + 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: newOwner1 }, { value: newOwner2 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

          expect(transactions).toHaveLength(3)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(3)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [
            SENTINEL_ADDRESS,
            oldOwner1,
            newOwner1,
          ])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'swapOwner', [oldOwner1, oldOwner2, newOwner2])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(3, 'removeOwner', [oldOwner2, oldOwner3, newThreshold])
        })
      })

      describe('with duplicates owners', () => {
        it('should swap as many differing owners as possible then remove the rest when the threshold remains the same', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()
          const oldOwner3 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()

          const oldThreshold = 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: oldOwner1 }, { value: newOwner1 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold: oldThreshold, newOwners })

          expect(transactions).toHaveLength(2)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(2)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [oldOwner1, oldOwner2, newOwner1])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'removeOwner', [oldOwner2, oldOwner3, oldThreshold])
        })

        it('should swap as many differing owners as possible then remove the rest when with a final threshold change if the threshold changes', () => {
          const safeAddresss = faker.finance.ethereumAddress()

          const oldOwner1 = faker.finance.ethereumAddress()
          const oldOwner2 = faker.finance.ethereumAddress()
          const oldOwner3 = faker.finance.ethereumAddress()

          const newOwner1 = faker.finance.ethereumAddress()

          const oldThreshold = 2
          const newThreshold = 1

          const safe = {
            address: { value: safeAddresss },
            owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
            threshold: oldThreshold,
          } as SafeInfo

          const newOwners = [{ value: oldOwner1 }, { value: newOwner1 }]

          const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

          expect(transactions).toHaveLength(2)

          expect(encodeFunctionDataSpy).toHaveBeenCalledTimes(2)
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, 'swapOwner', [oldOwner1, oldOwner2, newOwner1])
          expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, 'removeOwner', [oldOwner2, oldOwner3, newThreshold])
        })
      })
    })
  })

  describe('getRecoveryProposalTransaction', () => {
    it('should throw an error when no recovery transactions are found', () => {
      const safe = {
        address: { value: faker.finance.ethereumAddress() },
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
      } as SafeInfo

      expect(() =>
        getRecoveryProposalTransaction({
          safe,
          newThreshold: safe.threshold,
          newOwners: safe.owners,
        }),
      ).toThrow('No recovery transactions found')
    })

    it('should return the transaction when a single recovery transaction is found', () => {
      const safeAddresss = faker.finance.ethereumAddress()

      const oldOwner1 = faker.finance.ethereumAddress()
      const newOwner1 = faker.finance.ethereumAddress()

      const oldThreshold = 1

      const safe = {
        address: { value: safeAddresss },
        owners: [{ value: oldOwner1 }],
        threshold: oldThreshold,
      } as SafeInfo

      const newOwners = [{ value: newOwner1 }]

      const transaction = getRecoveryProposalTransaction({
        safe,
        newThreshold: oldThreshold,
        newOwners,
      })

      expect(transaction).toEqual({
        to: safeAddresss,
        value: '0',
        data: expect.any(String),
        operation: OperationType.Call,
      })
    })

    describe('when multiple recovery transactions are found', () => {
      it('should return a MetaTransactionData object ', () => {
        const safeAddresss = faker.finance.ethereumAddress()

        const oldOwner1 = faker.finance.ethereumAddress()
        const oldOwner2 = faker.finance.ethereumAddress()
        const oldOwner3 = faker.finance.ethereumAddress()

        const newOwner1 = faker.finance.ethereumAddress()
        const newOwner2 = faker.finance.ethereumAddress()
        const newOwner3 = faker.finance.ethereumAddress()

        const oldThreshold = 2
        const newThreshold = oldThreshold + 1

        const safe = {
          address: { value: safeAddresss },
          owners: [{ value: oldOwner1 }, { value: oldOwner2 }, { value: oldOwner3 }],
          threshold: oldThreshold,
        } as SafeInfo

        const multiSendDeployment = deployments.getMultiSendCallOnlyDeployment()!

        const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

        const transaction = getRecoveryProposalTransaction({
          safe,
          newThreshold,
          newOwners,
        })

        expect(transaction).toEqual({
          to: multiSendDeployment.defaultAddress,
          value: '0',
          data: expect.any(String),
          operation: OperationType.Call,
        })
      })

      it('should throw an error when MultiSend deployment is not found', () => {
        jest.spyOn(deployments, 'getMultiSendCallOnlyDeployment').mockReturnValue(undefined)

        const safeAddresss = faker.finance.ethereumAddress()

        const oldOwner1 = faker.finance.ethereumAddress()
        const oldOwner2 = faker.finance.ethereumAddress()

        const newOwner1 = faker.finance.ethereumAddress()
        const newOwner2 = faker.finance.ethereumAddress()
        const newOwner3 = faker.finance.ethereumAddress()

        const oldThreshold = 2

        const safe = {
          address: { value: safeAddresss },
          owners: [{ value: oldOwner1 }, { value: oldOwner2 }],
          threshold: oldThreshold,
        } as SafeInfo

        const newOwners = [{ value: newOwner1 }, { value: newOwner2 }, { value: newOwner3 }]

        expect(() =>
          getRecoveryProposalTransaction({
            safe,
            newThreshold: oldThreshold,
            newOwners,
          }),
        ).toThrow('MultiSend deployment not found')
      })
    })
  })
})
