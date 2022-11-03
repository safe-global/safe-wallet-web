const trimTrailingSlash = (url: string): string => {
  return url.replace(/\/$/, '')
}

const isSameUrl = (url1: string, url2: string): boolean => {
  return trimTrailingSlash(url1) === trimTrailingSlash(url2)
}
export const prefixedAddressRe = /[a-z0-9-]+\:0x[a-f0-9]{40}/i
const invalidProtocolRegex = /^(\W*)(javascript|data|vbscript)/im
const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim
const urlSchemeRegex = /^([^:]+):/gm
const relativeFirstCharacters = ['.', '/']
const isRelativeUrl = (url: string): boolean => {
  return relativeFirstCharacters.indexOf(url[0]) > -1
}

const sanitizeUrl = (url: string): string => {
  const sanitizedUrl = url.replace(ctrlCharactersRegex, '').trim()

  if (isRelativeUrl(sanitizedUrl)) {
    return sanitizedUrl
  }

  const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex)
  if (!urlSchemeParseResults) {
    return sanitizedUrl
  }

  const urlScheme = urlSchemeParseResults[0]
  if (invalidProtocolRegex.test(urlScheme)) {
    throw new Error('Invalid protocol')
  }

  return sanitizedUrl
}

export { trimTrailingSlash, isSameUrl, sanitizeUrl, isRelativeUrl }
