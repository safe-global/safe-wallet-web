import { renderHook } from '@/tests/test-utils'
import { Label, SafeInfo, Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { useGroupLabel } from '.'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as useTxQueueHook from '@/hooks/useTxQueue'

describe('GroupLabel', () => {
  describe('useGroupLabel', () => {
    it('should return Next if given a Next label', () => {
      const label = {
        label: 'Next',
        type: 'LABEL',
      } as Label

      const { result } = renderHook(() => useGroupLabel(label))

      expect(result.current).toBe('Next')
    })

    it('should return Next if given there is no multisig transaction in the page', () => {
      const label = {
        label: 'Next',
        type: 'LABEL',
      } as Label

      jest.spyOn(useTxQueueHook, 'default').mockImplementation(() => ({
        loading: false,
        page: {
          results: [
            // Label
            label,
            // Module transaction
            {
              transaction: {
                executionInfo: { type: 'MODULE' },
              },
            } as Transaction,
          ],
        },
      }))

      const { result } = renderHook(() => useGroupLabel(label))

      expect(result.current).toBe('Next')
    })

    it('should return a modified Queue label when there is a Queued and Next label in the page', () => {
      const label = {
        label: 'Queued',
        type: 'LABEL',
      } as Label

      jest.spyOn(useTxQueueHook, 'default').mockImplementation(() => ({
        loading: false,
        page: {
          results: [
            // Label
            {
              label: 'Next',
              type: 'LABEL',
            } as Label,
            // Multisig transaction
            {
              transaction: {
                executionInfo: { type: 'MULTISIG', nonce: 1 },
              },
              type: 'TRANSACTION',
            } as Transaction,
            // Label
            label,
            // Multisig transaction
            {
              transaction: {
                executionInfo: { type: 'MULTISIG', nonce: 2 },
              },
              type: 'TRANSACTION',
            } as Transaction,
          ],
        },
      }))

      const { result } = renderHook(() => useGroupLabel(label))

      expect(result.current).toBe('Queued - transaction with nonce 1 needs to be executed first')
    })

    it('should return a modified Queue label when there is a transaction with an out of order nonce in the page', () => {
      const label = {
        label: 'Queued',
        type: 'LABEL',
      } as Label

      jest.spyOn(useTxQueueHook, 'default').mockImplementation(() => ({
        loading: false,
        page: {
          results: [
            // Label
            label,
            // Multisig transaction
            {
              transaction: {
                executionInfo: { type: 'MULTISIG', nonce: 123 },
              },
              type: 'TRANSACTION',
            } as Transaction,
          ],
        },
      }))

      jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
        safeAddress: '0x0',
        safeLoaded: true,
        safeLoading: false,
        safe: {
          nonce: 7,
        } as SafeInfo,
      }))

      const { result } = renderHook(() => useGroupLabel(label))

      expect(result.current).toBe('Queued - transaction with nonce 7 needs to be executed first')
    })
  })
})
