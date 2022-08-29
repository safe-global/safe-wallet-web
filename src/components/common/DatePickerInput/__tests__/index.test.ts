import { _getDateError } from '@/components/common/DatePickerInput'

describe('DatePickInput', () => {
  describe('getDateError', () => {
    it('should return an error message for invalid dates', () => {
      const result = _getDateError('invalidDate')
      expect(result).toBe('Invalid date')
    })

    it('should return an error message for disabled dates', () => {
      const result = _getDateError('shouldDisableDate')
      expect(result).toBe('Cannot select chosen date')
    })

    it('should return an error message when future dates are disabled', () => {
      const result = _getDateError('disableFuture')
      expect(result).toBe('Date cannot be in the future')
    })

    it('should return an error message when past dates are disabled', () => {
      const result = _getDateError('disablePast')
      expect(result).toBe('Date cannot be in the past')
    })

    it('should otherwise return undefined', () => {
      const result1 = _getDateError('minDate')
      expect(result1).toBeUndefined()

      const result2 = _getDateError('minDate')
      expect(result2).toBeUndefined()

      //@ts-ignore
      const result3 = _getDateError('sidfughsoidfugh')
      expect(result3).toBeUndefined()
    })
  })
})
