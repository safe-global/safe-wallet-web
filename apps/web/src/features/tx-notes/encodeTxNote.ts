export function encodeTxNote(note: string, origin?: string): string {
  let originalOrigin = { url: '' }
  if (origin) {
    try {
      originalOrigin = JSON.parse(origin)
    } catch {
      // Ignore, no note
    }
  }
  if (!originalOrigin.url) {
    originalOrigin.url = location.origin
  }
  return JSON.stringify(
    {
      ...originalOrigin,
      note,
    },
    null,
    0,
  )
}
