import { getTxButtonTooltip } from '../utils'

describe('transactions utils', () => {
  describe('getTooltipTitle', () => {
    const disabledPropsBase = { hasSafeSDK: true }

    it('should return the enabledTitle if no disabled conditions', () => {
      const enabledTitle = 'Execute'

      expect(getTxButtonTooltip(enabledTitle, disabledPropsBase)).toBe('Execute')
    })

    it('should return the not isNext message', () => {
      const enabledTitle = 'Confirm'
      const nonce = 2
      const disabledProps = { ...disabledPropsBase, isNext: false, nonce }

      expect(getTxButtonTooltip(enabledTitle, disabledProps)).toBe('Transaction 2 must be executed first')
    })

    it('should return the SDK not initialized message', () => {
      const enabledTitle = 'Execute'
      const disabledProps = { ...disabledPropsBase, hasSafeSDK: false }

      expect(getTxButtonTooltip(enabledTitle, disabledProps)).toBe('Loading')
    })
  })
})
