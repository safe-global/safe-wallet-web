export const evalTemplate = (uri: string, data: string): string => {
  const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g
  return uri.replace(TEMPLATE_REGEX, data)
}
