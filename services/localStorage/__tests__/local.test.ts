import local from '../local'

describe('local storage', () => {
  const { getItem, setItem } = local

  beforeAll(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe('getItem', () => {
    it('returns a parsed value', () => {
      const stringifiedValue = JSON.stringify({ test: 'value' })
      window.localStorage.setItem('SAFE__test', stringifiedValue)

      expect(getItem('test')).toStrictEqual({ test: 'value' })
    })
    it("returns undefined the key doesn't exist", () => {
      expect(getItem('notAKey')).toBe(undefined)
    })
  })

  describe('setItem', () => {
    it('saves a stringified value', () => {
      setItem('test', true)
      expect(getItem('test')).toBe(true)
      expect(window.localStorage.getItem('SAFE__test')).toBe('true')
    })
  })

  describe('handling undefined', () => {
    it('saves ands reads undefined', () => {
      setItem('test_undefined', undefined)
      expect(getItem('test_undefined')).toBe(undefined)
      expect(window.localStorage.getItem('SAFE__test_undefined')).toBe('undefined')
    })
  })
})
