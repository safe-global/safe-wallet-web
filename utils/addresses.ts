
export const parsePrefixedAddress = (fullAddress: string): { address: string; prefix: string } => {
  const parts = fullAddress.split(':').filter(Boolean)
  const address = parts.length > 1 ? parts[1] : parts[0] || ''
  const prefix = parts.length > 1 && parts[0] || ''
  return { prefix, address }
}