import { getShortName, getChainId } from '@/utils/chains'

describe('chains', () => {
  describe('getShortName', () => {
    it('should return the prefix of a chain', () => {
      expect(getShortName('1')).toEqual('eth')
      expect(getShortName('5')).toEqual('gor')
      expect(getShortName('137')).toEqual('matic')
    })

    it('should return undefined when the prefix is not found', () => {
      expect(getShortName('132453456435645')).toEqual(undefined)
    })
  })

  describe('getChainId', () => {
    it('should return the chain id of a chain', () => {
      expect(getChainId('eth')).toEqual('1')
      expect(getChainId('gor')).toEqual('5')
      expect(getChainId('matic')).toEqual('137')
    })
    it('should return undefined when the chain id is not found', () => {
      expect(getShortName('sdfgserdgsdfgdfgd')).toEqual(undefined)
    })
  })
})
