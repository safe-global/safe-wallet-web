export function startsWith0x(str) {
  const pattern = /^0x/
  return pattern.test(str)
}

export const isInRedRange = (rgbColor) => {
  const [r, g, b] = rgbColor.match(/\d+/g).map(Number)
  return r >= 200 && r <= 255 && g >= 0 && g <= 95 && b >= 0 && b <= 120
}
