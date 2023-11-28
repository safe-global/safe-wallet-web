export const obfuscateNumber = (number: string | undefined) => {
  return number
    ? `${number.slice(0, 3)}${number
        .slice(3, -2)
        .split('')
        .map(() => '*')
        .join('')}${number.slice(-2)}`
    : undefined
}
