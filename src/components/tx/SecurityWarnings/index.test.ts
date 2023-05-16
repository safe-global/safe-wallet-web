import { SecuritySeverity } from '@/services/security/modules/types'
import { _mapSeverity, _mapRisk, _mapAction } from '.'

describe('SecurityWarnings', () => {
  describe('mapSeverity', () => {
    it('should return "error" when the severity is "HIGH', () => {
      expect(_mapSeverity(SecuritySeverity.HIGH)).toBe('error')
    })

    it('should return "warning" when the severity is "LOW', () => {
      expect(_mapSeverity(SecuritySeverity.LOW)).toBe('warning')
    })

    it('should return "success" when the severity is "NONE', () => {
      expect(_mapSeverity(SecuritySeverity.NONE)).toBe('success')
    })
  })

  describe('mapRisk', () => {
    it('should return "Critical risk" when the severity is "HIGH', () => {
      expect(_mapRisk(SecuritySeverity.HIGH)).toBe('Critical risk')
    })

    it('should return "Low risk" when the severity is "LOW', () => {
      expect(_mapRisk(SecuritySeverity.LOW)).toBe('Low risk')
    })

    it('should return "No issues found" when the severity is "NONE', () => {
      expect(_mapRisk(SecuritySeverity.NONE)).toBe('No issues found')
    })
  })

  describe('mapAction', () => {
    it('should return "Reject this transaction" when the severity is "HIGH', () => {
      expect(_mapAction(SecuritySeverity.HIGH)).toBe('Reject this transaction')
    })

    it('should return "Review before processing" when the severity is "LOW', () => {
      expect(_mapAction(SecuritySeverity.LOW)).toBe('Review before processing')
    })

    it('should return "Continue the transaction" when the severity is "NONE', () => {
      expect(_mapAction(SecuritySeverity.NONE)).toBe('Continue the transaction')
    })
  })
})
