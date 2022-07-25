/*
  The function takes a URL and "normalizes" it. For now, it only removes the trailing slash.
 */
const normalizeUrl = (url: string): string => {
  return url.replace(/\/$/, '')
}

export { normalizeUrl }
