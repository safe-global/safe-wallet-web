const trimTrailingSlash = (url: string): string => {
  return url.replace(/\/$/, '')
}

export { trimTrailingSlash }
