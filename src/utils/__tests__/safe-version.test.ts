import { hasFeature, enabledFeatures, FEATURES } from '../safe-versions'

describe('safe-version', () => {
  describe('enabledFeatures', () => {
    it('should return an empty array if the version is null', () => {
      expect(enabledFeatures(null)).toEqual([])
    })

    it('should return an array of the supported features of the specified version', () => {
      // 1.0.0
      expect(enabledFeatures('1.0.0')).toEqual([])

      // 1.1.0
      expect(enabledFeatures('1.1.0')).toEqual([FEATURES.ETH_SIGN])

      // 1.1.1
      expect(enabledFeatures('1.1.1')).toEqual([FEATURES.SAFE_FALLBACK_HANDLER, FEATURES.ETH_SIGN])

      // 1.3.0
      expect(enabledFeatures('1.3.0')).toEqual([
        FEATURES.SAFE_TX_GAS_OPTIONAL,
        FEATURES.SAFE_TX_GUARDS,
        FEATURES.SAFE_FALLBACK_HANDLER,
        FEATURES.ETH_SIGN,
      ])
    })
  })

  describe('hasFeature', () => {
    it('should return an false if the version is null', () => {
      expect(hasFeature(FEATURES.SAFE_FALLBACK_HANDLER, null)).toEqual(false)
    })

    it('should return false if the feature is not a valid feature', () => {
      // @ts-ignore
      expect(hasFeature('FAKE_FEATURE', '1.0.0')).toEqual(false)
    })

    it('should return an false if the version does not support the feature', () => {
      // 1.0.0
      expect(hasFeature(FEATURES.ETH_SIGN, '1.0.0')).toEqual(false)
      expect(hasFeature(FEATURES.SAFE_FALLBACK_HANDLER, '1.0.0')).toEqual(false)
      expect(hasFeature(FEATURES.SAFE_TX_GAS_OPTIONAL, '1.0.0')).toEqual(false)
      expect(hasFeature(FEATURES.SAFE_TX_GUARDS, '1.0.0')).toEqual(false)

      // 1.1.0
      expect(hasFeature(FEATURES.SAFE_TX_GAS_OPTIONAL, '1.1.0')).toEqual(false)
      expect(hasFeature(FEATURES.SAFE_TX_GUARDS, '1.1.0')).toEqual(false)

      // 1.1.1
      expect(hasFeature(FEATURES.SAFE_TX_GAS_OPTIONAL, '1.1.1')).toEqual(false)
      expect(hasFeature(FEATURES.SAFE_TX_GUARDS, '1.1.1')).toEqual(false)
    })

    it('should return true if the version supports the feature', () => {
      // 1.1.0
      expect(hasFeature(FEATURES.ETH_SIGN, '1.1.0')).toEqual(true)

      // 1.1.1
      expect(hasFeature(FEATURES.ETH_SIGN, '1.1.1')).toEqual(true)
      expect(hasFeature(FEATURES.SAFE_FALLBACK_HANDLER, '1.1.1')).toEqual(true)

      // 1.3.0
      expect(hasFeature(FEATURES.ETH_SIGN, '1.3.0')).toEqual(true)
      expect(hasFeature(FEATURES.SAFE_FALLBACK_HANDLER, '1.3.1')).toEqual(true)
      expect(hasFeature(FEATURES.SAFE_TX_GAS_OPTIONAL, '1.3.1')).toEqual(true)
      expect(hasFeature(FEATURES.SAFE_TX_GUARDS, '1.3.0')).toEqual(true)
    })
  })
})
