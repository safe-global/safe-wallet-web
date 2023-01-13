import { getMasterCopies } from '@safe-global/safe-gateway-typescript-sdk'
import { _getValidatedGetContractProps, isValidMasterCopy } from '../contracts/safeContracts'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  getMasterCopies: jest.fn(),
}))

describe('safeContracts', () => {
  describe('isValidMasterCopy', () => {
    it('returns false if address is not contained in result', async () => {
      ;(getMasterCopies as jest.Mock).mockResolvedValue([
        {
          address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
          version: '1.3.0',
          deployer: 'Gnosis',
          deployedBlockNumber: 12504268,
          lastIndexedBlockNumber: 14927028,
          l2: false,
        },
      ])

      const isValid = await isValidMasterCopy('1', '0x0000000000000000000000000000000000000005')
      expect(isValid).toBe(false)
    })

    it('returns true if address is contained in list', async () => {
      ;(getMasterCopies as jest.Mock).mockResolvedValue([
        {
          address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
          version: '1.3.0',
          deployer: 'Gnosis',
          deployedBlockNumber: 12504268,
          lastIndexedBlockNumber: 14927028,
          l2: false,
        },
        {
          address: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
          version: '1.3.0+L2',
          deployer: 'Gnosis',
          deployedBlockNumber: 12504423,
          lastIndexedBlockNumber: 14927028,
          l2: true,
        },
      ])

      const isValid = await isValidMasterCopy('1', '0x3E5c63644E683549055b9Be8653de26E0B4CD36E')
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

      expect(() => _getValidatedGetContractProps('1', '1.0.0')).toThrow('1.0.0 is not a valid Safe version')

      expect(() => _getValidatedGetContractProps('1', '')).toThrow(' is not a valid Safe version')
    })
  })
})
