import { TxFilterType } from '@/components/transactions/TxFilterForm/types'
import { _getIncomingFilter, _getMultisigFilter, _getModuleFilter } from '@/components/transactions/TxFilterForm/utils'

describe('Transaction filter utils', () => {
  describe('getIncomingFilter', () => {
    it('should extract the incoming filter values from the filter, correctly formatted', () => {
      const filter = {
        execution_date__gte: '1970-01-01',
        execution_date__lte: '2000-01-01',
        type: TxFilterType.INCOMING,
        value: '123',
      }

      expect(_getIncomingFilter(filter)).toEqual({
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
      })
    })
  })
  describe('getMultisigFilter', () => {
    it('should extract the incoming filter values from the filter, correctly formatted', () => {
      const filter = {
        __to: 'fakeaddress.eth',
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01',
        execution_date__lte: '2000-01-01',
        type: TxFilterType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      expect(_getMultisigFilter(filter)).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
      })
    })
    it('should add the executed param if defined', () => {
      const filter = {
        __to: 'fakeaddress.eth',
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01',
        execution_date__lte: '2000-01-01',
        type: TxFilterType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      expect(_getMultisigFilter(filter, true)).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
        executed: 'true',
      })
    })
  })
  describe('getModuleFilter', () => {
    it('should extract the incoming filter values from the filter, correctly formatted', () => {
      const filter = {
        __module: 'fakeaddress.eth',
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
        type: TxFilterType.MODULE,
      }

      expect(_getModuleFilter(filter)).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
      })
    })
  })
})
