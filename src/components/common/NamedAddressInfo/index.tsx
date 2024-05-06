import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { getContract } from '@safe-global/safe-gateway-typescript-sdk'
import EthHashInfo from '../EthHashInfo'
import type { EthHashInfoProps } from '../EthHashInfo/SrcEthHashInfo'

const NamedAddressInfo = ({ address, name, customAvatar, ...props }: EthHashInfoProps) => {
  const chainId = useChainId()
  const [contract] = useAsync(
    () => (!name && !customAvatar ? getContract(chainId, address) : undefined),
    [address, chainId, name, customAvatar],
  )

  return (
    <EthHashInfo
      address={address}
      name={name || contract?.displayName || contract?.name}
      customAvatar={customAvatar || contract?.logoUri}
      {...props}
    />
  )
}

export default NamedAddressInfo
