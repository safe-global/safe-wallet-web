import { _formatNumber } from '.'

describe('NumberField', () => {
  it('should trim the value', () => {
    expect(_formatNumber('  123  ')).toBe('123')
    expect(_formatNumber('  0.001  ')).toBe('0.001')
  })

  it('should remove the leading zeros', () => {
    expect(_formatNumber('000123')).toBe('123')
    expect(_formatNumber('0000.001')).toBe('0.001')
  })
})
