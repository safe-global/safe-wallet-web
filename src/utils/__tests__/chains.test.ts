import { getShortName, getChainId } from '@/utils/chains'

describe('chains', () => {
  describe('getShortName', () => {
    it('should return the short name of a chain', () => {
      expect(getShortName('1')).toEqual('eth')
      expect(getShortName('5')).toEqual('gor')
      expect(getShortName('137')).toEqual('matic')
    })
  })

  describe('getChainId', () => {
    it('should return the chain id of a chain', () => {
      expect(getChainId('eth')).toEqual('1')
      expect(getChainId('gor')).toEqual('5')
      expect(getChainId('matic')).toEqual('137')
    })
  })
})
