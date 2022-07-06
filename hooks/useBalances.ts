import { POLLING_INTERVAL } from '@/config/constants'
import { gatewayApi } from '@/store/gatewayApi'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

const useBalances = () => {
  const chainId = useChainId()
  const address = useSafeAddress()
  const currency = useAppSelector(selectCurrency)

  return gatewayApi.useGetBalancesQuery(
    {
      chainId: chainId!, // Can assert because we otherwise `skip`
      address: address!, // Can assert because we otherwise `skip`
      currency: currency!, // Can assert because we otherwise `skip`
    },
    {
      skip: !chainId || !address || !currency,
      pollingInterval: POLLING_INTERVAL,
    },
  )
}

export default useBalances
