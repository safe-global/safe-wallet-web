export function startsWith0x(str) {
  const pattern = /^0x/
  return pattern.test(str)
}
