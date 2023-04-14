import { hexZeroPad } from 'ethers/lib/utils'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { _getValidBatch } from '@/components/tx/modals/BatchExecuteModal/ReviewBatchExecute'
import type { TenderlySimulation } from '@/components/tx/TxSimulation/types'

describe('ReviewBatchExecute', () => {
  describe('_getValidBatch', () => {
    const mockBatch: MetaTransactionData[] = [
      {
        to: hexZeroPad('0x1', 20),
        value: '0',
        data: '0x1',
        operation: 0,
      },
      {
        to: hexZeroPad('0x2', 20),
        value: '0',
        data: '0x2',
        operation: 0,
      },
      {
        to: hexZeroPad('0x3', 20),
        value: '0',
        data: '0x3',
        operation: 0,
      },
      {
        to: hexZeroPad('0x4', 20),
        value: '0',
        data: '0x4',
        operation: 0,
      },
    ]

    it('should return the entire batch if there are no call errors', () => {
      const simulation = {
        transaction: {
          call_trace: [],
        },
      } as unknown as TenderlySimulation

      expect(_getValidBatch(mockBatch, simulation)).toStrictEqual(mockBatch)
    })

    it('should return all transactions before the reverted transaction', () => {
      const simulation = {
        transaction: {
          call_trace: [{ error: 'mockError', input: '0x3' }],
        },
      } as unknown as TenderlySimulation

      expect(_getValidBatch(mockBatch, simulation)).toStrictEqual([mockBatch[0], mockBatch[1]])
    })

    it('should return the entire batch if the reverted transaction was not found', () => {
      const simulation = {
        transaction: {
          call_trace: [{ error: 'mockError', input: '0x5' }],
        },
      } as unknown as TenderlySimulation

      expect(_getValidBatch(mockBatch, simulation)).toStrictEqual(mockBatch)
    })
  })
})
