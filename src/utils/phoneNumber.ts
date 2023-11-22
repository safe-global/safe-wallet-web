export const obfuscateNumber = (number: string | undefined) => {
  return number
    ? `${number.slice(0, 4)}${number
        .slice(4, -2)
        .split('')
        .map(() => '*')
        .join('')}${number.slice(-2)}`
    : undefined
}
