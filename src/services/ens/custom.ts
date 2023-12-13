import { type JsonRpcProvider } from '@ethersproject/providers'
import { Contract, utils, constants } from 'ethers'

// ENS Registry ABI (simplified version)
const ensRegistryAbi = ['function resolver(bytes32 node) external view returns (address)']
const resolverAbi = ['function addr(bytes32 node) external view returns (address)']

export const customResolveName = async (
  registryAddress: string,
  rpcProvider: JsonRpcProvider,
  name: string,
): Promise<string | undefined> => {
  const ensRegistry = new Contract(registryAddress, ensRegistryAbi, rpcProvider)
  const namehash = utils.namehash(name)
  const resolverAddress = await ensRegistry.resolver(namehash)

  if (resolverAddress === constants.AddressZero) {
    return undefined
  }

  const resolver = new Contract(resolverAddress, resolverAbi, rpcProvider)
  const address = await resolver.addr(namehash)

  return address || undefined
}
