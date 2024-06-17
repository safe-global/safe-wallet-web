import Safe from '@safe-global/protocol-kit'

export async function createSafes(safeConfigurations) {
  const safes = []
  for (const config of safeConfigurations) {
    const safe = await Safe.init({
      ethAdapter: config.ethAdapter,
      safeAddress: config.safeAddress,
    })
    safes.push(safe)
  }
  return safes
}
