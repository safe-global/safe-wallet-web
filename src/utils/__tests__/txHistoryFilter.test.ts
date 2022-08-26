import { getIncomingTransfers, getMultisigTransactions, getModuleTransactions } from '@gnosis.pm/safe-react-gateway-sdk'
import type { ParsedUrlQuery } from 'querystring'

import {
  _hasTxFilterType,
  hasTxFilterQuery,
  omitFilterQuery,
  _isString,
  _getDateISO,
  _getIncomingFilter,
  _getMultisigFilter,
  _getModuleFilter,
  getTxFilterQuery,
  getFilteredTxHistory,
} from '@/utils/txHistoryFilter'
import { TxFilterFormState, TxFilterFormType } from '@/components/transactions/TxFilterForm'

jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  getIncomingTransfers: jest.fn(),
  getMultisigTransactions: jest.fn(),
  getModuleTransactions: jest.fn(),
}))

describe('Transaction filter utils', () => {
  describe('hasTxFilterType', () => {
    it('should return true when a correct `type` exists', () => {
      const result1 = _hasTxFilterType({ type: 'Incoming' })
      expect(result1).toBe(true)

      const result2 = _hasTxFilterType({ type: 'Outgoing' })
      expect(result2).toBe(true)

      const result3 = _hasTxFilterType({ type: 'Module-based' })
      expect(result3).toBe(true)
    })

    it('should return false when no `type` exists', () => {
      const result1 = _hasTxFilterType({ type: '' })
      expect(result1).toBe(false)

      const result2 = _hasTxFilterType({})
      expect(result2).toBe(false)

      const result3 = _hasTxFilterType({ type: undefined })
      expect(result3).toBe(false)
    })

    it('should return false when an incorrect `type` exists', () => {
      const result = _hasTxFilterType({ type: 'Test' })
      expect(result).toBe(false)
    })
  })

  describe('hasTxFilterQuery', () => {
    it('should return true when a valid transaction filter query exists', () => {
      const result1 = hasTxFilterQuery({ type: 'Incoming', value: '12345' })
      expect(result1).toBe(true)

      const result2 = hasTxFilterQuery({ type: 'Outgoing', nonce: '1' })
      expect(result2).toBe(true)

      const result3 = hasTxFilterQuery({ type: 'Module-based', to: '0x123' })
      expect(result3).toBe(true)
    })

    it('should return false when an invalid transaction filter query exists', () => {
      const result1 = hasTxFilterQuery({ type: '' })
      expect(result1).toBe(false)

      const result2 = hasTxFilterQuery({ nonce: '1' })
      expect(result2).toBe(false)

      const result3 = hasTxFilterQuery({ type: 'Test', to: '0x123' })
      expect(result3).toBe(false)
    })
  })

  describe('omitFilterQuery', () => {
    it('should remove transaction filters from queries', () => {
      const result = omitFilterQuery({
        type: 'Outgoing',
        value: '1000000',
        test: 'query',
      })

      expect(result).toEqual({ test: 'query' })
    })
  })

  describe('isString', () => {
    it('should return true if a string of at least 1 character length exists', () => {
      const result1 = _isString('1')
      expect(result1).toBe(true)

      const result2 = _isString('1241245qwrafgsdfgsedt5')
      expect(result2).toBe(true)
    })

    it('should return false if it is an invalid string', () => {
      const result = _isString('')
      expect(result).toBe(false)
    })

    it('should return false for non strings', () => {
      const result1 = _isString(324523453453)
      expect(result1).toBe(false)

      const result2 = _isString(false)
      expect(result2).toBe(false)

      const result3 = _isString(null)
      expect(result3).toBe(false)
    })
  })

  describe('getDateISO', () => {
    it('should return an ISOString of a date object', () => {
      const result = _getDateISO(new Date('1970-01-01'))
      expect(result).toBe('1970-01-01T00:00:00.000Z')
    })

    it('should return an ISOString of string date', () => {
      const result1 = _getDateISO('1970-01-01')
      expect(result1).toBe('1970-01-01T00:00:00.000Z')

      const result2 = _getDateISO('1970-01-01T00:00:00.000Z')
      expect(result2).toBe('1970-01-01T00:00:00.000Z')
    })
  })

  describe('getIncomingFilter', () => {
    it('should extract the incoming filter values from the filter, correctly formatted', () => {
      const filter1: TxFilterFormState = {
        execution_date__gte: new Date('1970-01-01'),
        execution_date__lte: null,
        type: TxFilterFormType.INCOMING,
        value: '123',
      }

      const result1 = _getIncomingFilter(filter1)
      expect(result1).toEqual({
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        value: '123000000000000000000',
      })

      const filter2: ParsedUrlQuery = {
        execution_date__lte: '2000-01-01',
        type: TxFilterFormType.INCOMING,
        value: '123',
      }

      const result2 = _getIncomingFilter(filter2)
      expect(result2).toEqual({
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
      })
    })
  })
  describe('getMultisigFilter', () => {
    it('should extract the incoming filter values from the filter, correctly formatted', () => {
      const filter1: TxFilterFormState = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: new Date('1970-01-01'),
        execution_date__lte: null,
        type: TxFilterFormType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      const result1 = _getMultisigFilter(filter1)
      expect(result1).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
        executed: 'true',
      })

      const filter2: ParsedUrlQuery = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01',
        execution_date__lte: '2000-01-01',
        type: TxFilterFormType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      const result2 = _getMultisigFilter(filter2)
      expect(result2).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
        executed: 'true',
      })
    })
    it('should add the executed param by default', () => {
      const filter1: TxFilterFormState = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: new Date('1970-01-01'),
        execution_date__lte: null,
        type: TxFilterFormType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      const result1 = _getMultisigFilter(filter1)
      expect(result1).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
        executed: 'true',
      })

      const filter2: ParsedUrlQuery = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__lte: '2000-01-01',
        type: TxFilterFormType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      const result2 = _getMultisigFilter(filter2)
      expect(result2).toEqual({
        to: '0x1234567890123456789012345678901234567890',
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
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
        type: TxFilterFormType.MODULE,
      }

      const result = _getModuleFilter(filter)
      expect(result).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
      })
    })
  })

  describe('getTxFilterQuery', () => {
    it('should return correctly formatted incoming filters', () => {
      const incomingFilter1: TxFilterFormState = {
        execution_date__gte: new Date('1970-01-01'),
        execution_date__lte: null,
        type: TxFilterFormType.INCOMING,
        value: '123',
      }

      const result1 = getTxFilterQuery(incomingFilter1)
      expect(result1).toEqual({
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        type: 'Incoming',
      })

      const incomingFilter2: ParsedUrlQuery = {
        execution_date__lte: '2000-01-01',
        type: TxFilterFormType.INCOMING,
        value: '123',
      }

      const result2 = getTxFilterQuery(incomingFilter2)
      expect(result2).toEqual({
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        type: 'Incoming',
      })
    })

    it('should return correctly formatted multisig filters', () => {
      const multisigFilter1: TxFilterFormState = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: new Date('1970-01-01'),
        execution_date__lte: null,
        type: TxFilterFormType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      const result1 = getTxFilterQuery(multisigFilter1)
      expect(result1).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
        type: 'Outgoing',
        executed: 'true',
      })

      const multisigFilter2: ParsedUrlQuery = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01',
        execution_date__lte: '2000-01-01',
        type: TxFilterFormType.MULTISIG,
        value: '123',
        nonce: '123',
      }

      const result2 = getTxFilterQuery(multisigFilter2)
      expect(result2).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01T00:00:00.000Z',
        execution_date__lte: '2000-01-01T00:00:00.000Z',
        value: '123000000000000000000',
        nonce: '123',
        type: 'Outgoing',
        executed: 'true',
      })
    })

    it('should return correctly formatted module filters', () => {
      const moduleFilter = {
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
        type: TxFilterFormType.MODULE,
      }

      const result = getTxFilterQuery(moduleFilter)
      expect(result).toEqual({
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
        type: 'Module-based',
      })
    })
    it('should return undefined if an invalid or missing `type` is provided', () => {
      const incomingFilter = {
        execution_date__gte: new Date('1970-01-01'),
        value: '123',
      } as TxFilterFormState

      const result1 = getTxFilterQuery(incomingFilter)
      expect(result1).toBeUndefined()

      const multisigFilter = {
        to: '0x1234567890123456789012345678901234567890',
        execution_date__gte: '1970-01-01',
        execution_date__lte: '2000-01-01',
        value: '123',
        nonce: '123',
        type: undefined,
      }

      const result2 = getTxFilterQuery(multisigFilter)
      expect(result2).toBeUndefined()

      const moduleFilter = {
        to: '0x1234567890123456789012345678901234567890',
        module: '0x1234567890123456789012345678901234567890',
        type: 'Test',
      }

      const result3 = getTxFilterQuery(moduleFilter)
      expect(result3).toBeUndefined()
    })
  })

  describe('getFilteredTxHistory', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should get incoming transfers relevant to `type`', () => {
      getFilteredTxHistory('4', '0x123', { type: 'Incoming', value: '123' }, 'pageUrl1')

      expect(getIncomingTransfers).toHaveBeenCalledWith('4', '0x123', { value: '123000000000000000000' }, 'pageUrl1')

      expect(getMultisigTransactions).not.toHaveBeenCalled()
      expect(getModuleTransactions).not.toHaveBeenCalled()
    })

    it('should get outgoing transfers relevant to `type`', () => {
      getFilteredTxHistory(
        '100',
        '0x456',
        { type: 'Outgoing', execution_date__gte: '1970-01-01T00:00:00.000Z' },
        'pageUrl2',
      )

      expect(getMultisigTransactions).toHaveBeenCalledWith(
        '100',
        '0x456',
        { execution_date__gte: '1970-01-01T00:00:00.000Z', executed: 'true' },
        'pageUrl2',
      )

      expect(getIncomingTransfers).not.toHaveBeenCalled()
      expect(getModuleTransactions).not.toHaveBeenCalled()
    })

    it('should get module transfers relevant to `type`', () => {
      getFilteredTxHistory('1', '0x789', { type: 'Module-based', to: '0x123' }, 'pageUrl3')

      expect(getModuleTransactions).toHaveBeenCalledWith('1', '0x789', { to: '0x123' }, 'pageUrl3')

      expect(getIncomingTransfers).not.toHaveBeenCalled()
      expect(getMultisigTransactions).not.toHaveBeenCalled()
    })

    it('should return undefined if invalid `type`', () => {
      getFilteredTxHistory('1', '0x789', { type: 'Test', token_address: '0x123' }, 'pageUrl3')

      expect(getIncomingTransfers).not.toHaveBeenCalled()
      expect(getIncomingTransfers).not.toHaveBeenCalled()
      expect(getMultisigTransactions).not.toHaveBeenCalled()
    })
  })
})
