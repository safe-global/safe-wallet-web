import { faker } from '@faker-js/faker/locale/af_ZA'
import { getSharedSetup, isMultiChainSafeItem } from './multiChainSafe'
import { PendingSafeStatus } from '@/store/slices'
import { PayMethod } from '@/features/counterfactual/PayNowPayLater'

describe('multiChainSafe', () => {
  describe('isMultiChainSafeItem', () => {
    it('should return true for MultiChainSafeIem', () => {
      expect(
        isMultiChainSafeItem({
          address: faker.finance.ethereumAddress(),
          safes: [
            {
              address: faker.finance.ethereumAddress(),
              chainId: '1',
              isWatchlist: false,
            },
          ],
        }),
      ).toBeTruthy()
    })

    it('should return false for SafeItem', () => {
      expect(
        isMultiChainSafeItem({
          address: faker.finance.ethereumAddress(),
          chainId: '1',
          isWatchlist: false,
        }),
      ).toBeFalsy()
    })
  })

  describe('getSharedSetup', () => {
    it('should return undefined if no setup infos available', () => {
      expect(
        getSharedSetup(
          [
            {
              address: faker.finance.ethereumAddress(),
              chainId: '1',
              isWatchlist: false,
            },
          ],
          [],
          undefined,
        ),
      ).toBeUndefined()
    })

    it('should return undefined if the owners do not match', () => {
      const address = faker.finance.ethereumAddress()

      // 2 Safes. One with 1 and one with 2 owners.
      const owners1 = [
        {
          value: faker.finance.ethereumAddress(),
        },
      ]
      const owners2 = [...owners1, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners: owners1,
              queued: 0,
              threshold: 1,
            },
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '100',
              fiatTotal: '0',
              owners: owners2,
              queued: 0,
              threshold: 1,
            },
          ],
          undefined,
        ),
      ).toBeUndefined()
    })
    it('should return undefined if the threshold does not match', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 1,
            },
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '100',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 2,
            },
          ],
          undefined,
        ),
      ).toBeUndefined()
    })

    it('should return the shared setup if owners and threshold matches', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 2,
            },
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '100',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 2,
            },
          ],
          undefined,
        ),
      ).toEqual({ owners: owners.map((owner) => owner.value), threshold: 2 })
    })

    it('should return undefined if owners do not match and some Safes are undeployed', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 2,
            },
          ],
          {
            ['100']: {
              [address]: {
                props: {
                  safeAccountConfig: {
                    owners: owners.map((owner) => owner.value),
                    threshold: 1,
                  },
                },
                status: {
                  status: PendingSafeStatus.AWAITING_EXECUTION,
                  type: PayMethod.PayLater,
                },
              },
            },
          },
        ),
      ).toBeUndefined()
    })

    it('should return undefined if some owner data is missing', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 2,
            },
          ],
          {},
        ),
      ).toBeUndefined()
    })

    it('should return undefined if threshold does not match and some Safes are undeployed', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners: owners.slice(0, 1),
              queued: 0,
              threshold: 1,
            },
          ],
          {
            ['100']: {
              [address]: {
                props: {
                  safeAccountConfig: {
                    owners: owners.map((owner) => owner.value),
                    threshold: 1,
                  },
                },
                status: {
                  status: PendingSafeStatus.AWAITING_EXECUTION,
                  type: PayMethod.PayLater,
                },
              },
            },
          },
        ),
      ).toBeUndefined()
    })

    it('should return the shared setup if owners and threshold matches and some Safes are undeployed', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [
            {
              address: {
                value: address,
              },
              awaitingConfirmation: null,
              chainId: '1',
              fiatTotal: '0',
              owners,
              queued: 0,
              threshold: 2,
            },
          ],
          {
            ['100']: {
              [address]: {
                props: {
                  safeAccountConfig: {
                    owners: owners.map((owner) => owner.value),
                    threshold: 2,
                  },
                },
                status: {
                  status: PendingSafeStatus.AWAITING_EXECUTION,
                  type: PayMethod.PayLater,
                },
              },
            },
          },
        ),
      ).toEqual({ owners: owners.map((owner) => owner.value), threshold: 2 })
    })

    it('should return the shared setup if owners and threshold matches and all Safes are undeployed', () => {
      const address = faker.finance.ethereumAddress()

      const owners = [{ value: faker.finance.ethereumAddress() }, { value: faker.finance.ethereumAddress() }]

      expect(
        getSharedSetup(
          [
            {
              address,
              chainId: '1',
              isWatchlist: false,
            },
            {
              address,
              chainId: '100',
              isWatchlist: false,
            },
          ],
          [],
          {
            ['1']: {
              [address]: {
                props: {
                  safeAccountConfig: {
                    owners: owners.map((owner) => owner.value),
                    threshold: 2,
                  },
                },
                status: {
                  status: PendingSafeStatus.AWAITING_EXECUTION,
                  type: PayMethod.PayLater,
                },
              },
            },
            ['100']: {
              [address]: {
                props: {
                  safeAccountConfig: {
                    owners: owners.map((owner) => owner.value),
                    threshold: 2,
                  },
                },
                status: {
                  status: PendingSafeStatus.AWAITING_EXECUTION,
                  type: PayMethod.PayLater,
                },
              },
            },
          },
        ),
      ).toEqual({ owners: owners.map((owner) => owner.value), threshold: 2 })
    })
  })
})
