const trimTrailingSlash = (url: string): string => {
  return url.replace(/\/$/, '')
}

const isSameUrl = (url1: string, url2: string): boolean => {
  return trimTrailingSlash(url1) === trimTrailingSlash(url2)
}

export { trimTrailingSlash, isSameUrl }
