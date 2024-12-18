import { getTimezone } from '.'

describe('getTimezone', () => {
  it('should return timezone', () => {
    const result = getTimezone()

    expect(result).toBeDefined()
  })
})
