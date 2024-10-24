import { vi } from 'vitest'

globalThis.expo = {}

vi.mock('react-native-mmkv', () => ({
  MMKV: function () {
    this.getString = vi.fn()
    this.delete = vi.fn()
    this.set = vi.fn()
  },
}))
