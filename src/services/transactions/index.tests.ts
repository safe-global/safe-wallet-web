import { getTimezoneOffset } from '.'

describe('getTimezoneOffset', () => {
  it('should return timezone offset in milliseconds', () => {
    const CET = 60 * 60 * 1000 // tests are run in CET
    expect(getTimezoneOffset()).toBe(-CET)
  })
})
