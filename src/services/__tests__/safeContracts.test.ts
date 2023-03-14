import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { _getValidatedGetContractProps, isValidMasterCopy } from '../contracts/safeContracts'

describe('safeContracts', () => {
  describe('isValidMasterCopy', () => {
    it('returns false if the implementation is unknown', async () => {
      const isValid = isValidMasterCopy({
        implementationVersionState: 'UNKNOWN',
      } as SafeInfo)

      expect(isValid).toBe(false)
    })

    it('returns true if the implementation is up-to-date', async () => {
      const isValid = isValidMasterCopy({
        implementationVersionState: 'UP_TO_DATE',
      } as SafeInfo)

      expect(isValid).toBe(true)
    })

    it('returns true if the implementation is outdated', async () => {
      const isValid = isValidMasterCopy({
        implementationVersionState: 'OUTDATED',
      } as SafeInfo)

      expect(isValid).toBe(true)
    })
  })
  describe('getValidatedGetContractProps', () => {
    it('should return the correct props', () => {
      expect(_getValidatedGetContractProps('1', '1.1.1')).toEqual({
        chainId: 1,
        safeVersion: '1.1.1',
      })

      expect(_getValidatedGetContractProps('1', '1.2.0')).toEqual({
        chainId: 1,
        safeVersion: '1.2.0',
      })

      expect(_getValidatedGetContractProps('1', '1.3.0')).toEqual({
        chainId: 1,
        safeVersion: '1.3.0',
      })

      expect(_getValidatedGetContractProps('1', '1.3.0+L2')).toEqual({
        chainId: 1,
        safeVersion: '1.3.0',
      })
    })
    it('should throw if the Safe version is invalid', () => {
      expect(() => _getValidatedGetContractProps('1', '1.3.1')).toThrow('1.3.1 is not a valid Safe version')

      expect(() => _getValidatedGetContractProps('1', '1.4.0')).toThrow('1.4.0 is not a valid Safe version')

      expect(() => _getValidatedGetContractProps('1', '0.0.1')).toThrow('0.0.1 is not a valid Safe version')

      expect(() => _getValidatedGetContractProps('1', '')).toThrow(' is not a valid Safe version')
    })
  })
})
