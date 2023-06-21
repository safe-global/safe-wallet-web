import { SecuritySeverity } from '@/services/security/modules/types'
import { mapSeverityComponentProps } from '.'

describe('SecurityWarnings', () => {
  describe('mapSeverity', () => {
    it('should return "error" when the severity is "HIGH', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.HIGH].color).toBe('error')
    })

    it('should return "warning" when the severity is "LOW', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.LOW].color).toBe('warning')
    })

    it('should return "info" when the severity is "NONE', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.NONE].color).toBe('info')
    })
  })

  describe('mapRisk', () => {
    it('should return "Critical risk" when the severity is "HIGH', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.HIGH].label).toBe('High issue')
    })

    it('should return "Low risk" when the severity is "LOW', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.LOW].label).toBe('Low issue')
    })

    it('should return "No issues found" when the severity is "NONE', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.NONE].label).toBe('No issues found')
    })
  })

  describe('mapAction', () => {
    it('should return "Reject this transaction" when the severity is "HIGH', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.HIGH].action).toBe('Reject this transaction')
    })

    it('should return "Review before processing" when the severity is "LOW', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.LOW].action).toBe('Review before processing')
    })

    it('should return undefined when the severity is "NONE', () => {
      expect(mapSeverityComponentProps[SecuritySeverity.NONE].action).toBe(undefined)
    })
  })
})
