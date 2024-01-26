import { Contract, namehash, ZeroAddress, type Provider } from 'ethers'

// ENS Registry ABI (simplified version)
const ensRegistryAbi = ['function resolver(bytes32 node) external view returns (address)']
const resolverAbi = ['function addr(bytes32 node) external view returns (address)']

export const customResolveName = async (
  registryAddress: string,
  rpcProvider: Provider,
  name: string,
): Promise<string | undefined> => {
  const ensRegistry = new Contract(registryAddress, ensRegistryAbi, rpcProvider)
  const nhash = namehash(name)
  const resolverAddress = await ensRegistry.resolver(nhash)

  if (resolverAddress === ZeroAddress) {
    return undefined
  }

  const resolver = new Contract(resolverAddress, resolverAbi, rpcProvider)
  const address = await resolver.addr(nhash)

  return address || undefined
}
