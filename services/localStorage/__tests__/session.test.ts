import { loadFromSessionStorage, removeFromSessionStorage, saveToSessionStorage } from '../session'

describe('session storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  describe('loadFromSessionStorage', () => {
    it('returns a parsed value', () => {
      const stringifiedValue = JSON.stringify({ test: 'value' })
      window.sessionStorage.setItem('SAFE__test', stringifiedValue)

      expect(loadFromSessionStorage('test')).toStrictEqual({ test: 'value' })
    })
    it("returns undefined the key doesn't exist", () => {
      expect(loadFromSessionStorage('notAKey')).toBe(undefined)
    })
  })

  describe('saveToSessionStorage', () => {
    it('saves a stringified value', () => {
      saveToSessionStorage('test', true)

      expect(window.sessionStorage?.SAFE__test).toBe('true')
    })
  })

  describe('removeFromSessionStorage', () => {
    it('removes the key', () => {
      window.sessionStorage.setItem('SAFE__test', '1')
      removeFromSessionStorage('test')
      expect(window.sessionStorage.getItem('SAFE__test')).toBe(null)
    })
  })
})
