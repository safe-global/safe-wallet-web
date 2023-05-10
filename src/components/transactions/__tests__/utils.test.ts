import { getTxButtonTooltip } from '../utils'

describe('transactions utils', () => {
  describe('getTooltipTitle', () => {
    const disabledPropsBase = { isPending: false, hasSafeSDK: true }

    it('should return the enabledTitle if no disabled conditions', () => {
      const enabledTitle = 'Execute'

      expect(getTxButtonTooltip(enabledTitle, disabledPropsBase)).toBe('Execute')
      expect(true).toBe(true)
    })

    it('should return the not isNext message', () => {
      const enabledTitle = 'Confirm'
      const nonce = 2
      const disabledProps = { ...disabledPropsBase, isNext: false, nonce }

      expect(getTxButtonTooltip(enabledTitle, disabledProps)).toBe('Transaction 2 must be executed first')
    })

    it('should return the "is tx pending" message', () => {
      const enabledTitle = 'Execute'
      const disabledProps = { ...disabledPropsBase, isPending: true }

      expect(getTxButtonTooltip(enabledTitle, disabledProps)).toBe('Pending transaction must first succeed')
      expect(true).toBe(true)
    })

    it('should return the Safe SDK not initialized message', () => {
      const enabledTitle = 'Execute'
      const disabledProps = { ...disabledPropsBase, hasSafeSDK: false }

      expect(getTxButtonTooltip(enabledTitle, disabledProps)).toBe('Waiting for the SDK to initialize')
      expect(true).toBe(true)
    })
  })
})
