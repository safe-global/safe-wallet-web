import { hasFeature, getBlockExplorerLink, FEATURES, getLatestSafeVersion } from '@/utils/chains'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'
import { chainBuilder } from '@/tests/builders/chains'

describe('chains', () => {
  describe('hasFeature', () => {
    it('returns true for a feature that exists', () => {
      expect(hasFeature(CONFIG_SERVICE_CHAINS[0], FEATURES.ERC721)).toBe(true)
    })

    it("returns false for a feature that doesn't exists", () => {
      expect(
        hasFeature(
          {
            ...CONFIG_SERVICE_CHAINS[0],
            features: [],
          },
          FEATURES.DOMAIN_LOOKUP,
        ),
      ).toBe(false)
    })
  })

  describe('getExplorerLink', () => {
    it('returns the correct link for an address', () => {
      expect(getBlockExplorerLink(CONFIG_SERVICE_CHAINS[0], '0x123')).toEqual({
        href: 'https://etherscan.io/address/0x123',
        title: 'View on etherscan.io',
      })
    })

    it('returns the correct link for a transaction', () => {
      expect(
        getBlockExplorerLink(CONFIG_SERVICE_CHAINS[0], '0x123436456456754735474574575475675435353453465645645656'),
      ).toEqual({
        href: 'https://etherscan.io/tx/0x123436456456754735474574575475675435353453465645645656',
        title: 'View on etherscan.io',
      })
    })
  })

  describe('chains', () => {
    describe('getLatestSafeVersion', () => {
      it('should return 1.4.1 on supported networks', () => {
        expect(
          getLatestSafeVersion(
            chainBuilder()
              .with({ chainId: '1', features: [FEATURES.SAFE_141 as any] })
              .build(),
          ),
        ).toEqual('1.4.1')
        expect(
          getLatestSafeVersion(
            chainBuilder()
              .with({ chainId: '137', features: [FEATURES.SAFE_141 as any] })
              .build(),
          ),
        ).toEqual('1.4.1')
        expect(
          getLatestSafeVersion(
            chainBuilder()
              .with({ chainId: '11155111', features: [FEATURES.SAFE_141 as any] })
              .build(),
          ),
        ).toEqual('1.4.1')
      })

      it('should return 1.3.0 on networks where 1.4.1 is not released', () => {
        expect(
          getLatestSafeVersion(
            chainBuilder()
              .with({ chainId: '324', features: [FEATURES.SAFE_141 as any] })
              .build(),
          ),
        ).toEqual('1.3.0')
      })

      it('should return 1.3.0 if the feature is off', () => {
        expect(getLatestSafeVersion(chainBuilder().with({ chainId: '1', features: [] }).build())).toEqual('1.3.0')
        expect(getLatestSafeVersion(chainBuilder().with({ chainId: '137', features: [] }).build())).toEqual('1.3.0')
        expect(getLatestSafeVersion(chainBuilder().with({ chainId: '11155111', features: [] }).build())).toEqual(
          '1.3.0',
        )
      })
    })
  })
})
