type LS_ITEM = string | number | boolean | null

export type LOCAL_STORAGE_DATA = Record<string, LS_ITEM>

export const parseLsValue = <T>(value: LS_ITEM): T | undefined => {
  if (typeof value === 'string' && value.length > 0) {
    try {
      return JSON.parse(value) as T
    } catch (e) {
      console.error('Failed to parse stored value', value)
      return
    }
  }
}
