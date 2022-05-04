/**
 * Setups `shortenText` options
 * @param {object} opts
 * @param {number} opts.charsStart=10 - characters to preserve from the beginning
 * @param {number} opts.charsEnd=10 - characters to preserve at the end
 * @param {string} opts.ellipsis='...' - ellipsis characters
 * @returns {function} shortener
 */
export const textShortener =
  ({ charsEnd = 10, charsStart = 10, ellipsis = '...' } = {}) =>
  /**
   * @function
   * @name shortener
   *
   * Shortens a text string based on options
   * @param {string} text=null - String to shorten
   * @param text
   * @returns {string|?string}
   */
  (text = ''): string => {
    const amountOfCharsToKeep = charsEnd + charsStart
    const finalStringLength = amountOfCharsToKeep + ellipsis.length

    if (finalStringLength >= text.length || !amountOfCharsToKeep) {
      // no need to shorten
      return text
    }

    const r = new RegExp(`^(.{${charsStart}}).+(.{${charsEnd}})$`)
    const matchResult = r.exec(text)

    if (!matchResult) {
      // if for any reason the exec returns null, the text remains untouched
      return text
    }

    const [, textStart, textEnd] = matchResult

    return `${textStart}${ellipsis}${textEnd}`
  }

/**
 * Util to remove whitespace from both sides of a string.
 * @param {string} value
 * @returns {string} string without side whitespaces
 */
export const trimSpaces = (value: string): string => (value === undefined ? '' : value.trim())

/**
 * Util to compare two strings, comparison is case insensitive
 * @param str1
 * @param str2
 * @returns {boolean}
 */
export const sameString = (str1: string | undefined, str2: string | undefined): boolean => {
  if (!str1 || !str2) {
    return false
  }

  return str1.toLowerCase() === str2.toLowerCase()
}
