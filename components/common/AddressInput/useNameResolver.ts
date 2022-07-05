import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useAsync from '@/hooks/useAsync'
import { resolveName } from '@/services/domains'

const useNameResolver = (value: string): { address: string | undefined; resolving: boolean } => {
  const ethersProvider = useWeb3ReadOnly()

  // Fetch an ENS resolution for the current address
  const [ens, , resolving] = useAsync<{ name: string; address: string } | undefined>(async () => {
    if (!ethersProvider) return
    const address = await resolveName(ethersProvider, value)
    return address ? { address, name: value } : undefined
  }, [value, ethersProvider])

  return {
    resolving: !!ethersProvider && resolving,
    address: ens && ens.name === value ? ens.address : undefined,
  }
}

export default useNameResolver
