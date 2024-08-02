import { getLatestSafeVersion } from './chains'

describe('chains', () => {
  describe('getLatestSafeVersion', () => {
    it('should return 1.4.1 on supported networks', () => {
      expect(getLatestSafeVersion('1')).toEqual('1.4.1')
      expect(getLatestSafeVersion('137')).toEqual('1.4.1')
      expect(getLatestSafeVersion('11155111')).toEqual('1.4.1')
    })

    it('should return 1.3.0 on networks where 1.4.1 is not released', () => {
      expect(getLatestSafeVersion('324')).toEqual('1.3.0')
    })
  })
})
