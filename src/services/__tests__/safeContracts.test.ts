import { _getValidatedGetContractProps } from '../contracts/safeContracts'

describe('safeContracts', () => {
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
      expect(() => _getValidatedGetContractProps('1', '1.3.1')).toThrow(
        '1.3.1 is not a Safe version supported by the safe-core-sdk',
      )

      expect(() => _getValidatedGetContractProps('1', '1.4.0')).toThrow(
        '1.4.0 is not a Safe version supported by the safe-core-sdk',
      )

      expect(() => _getValidatedGetContractProps('1', '1.0.0')).toThrow(
        '1.0.0 is not a Safe version supported by the safe-core-sdk',
      )

      expect(() => _getValidatedGetContractProps('1', '')).toThrow(
        ' is not a Safe version supported by the safe-core-sdk',
      )
    })
  })
})
