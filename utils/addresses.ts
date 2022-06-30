export const sameAddress = (firstAddress: string | undefined, secondAddress: string | undefined): boolean => {
  if (!firstAddress || !secondAddress) {
    return false
  }

  return firstAddress.toLowerCase() === secondAddress.toLowerCase()
}

export const parsePrefixedAddress = (value: string): { prefix?: string; address: string } => {
  const [prefix, address] = value.split(':')
  return {
    prefix: address ? prefix : undefined,
    address: address || value,
  }
}
