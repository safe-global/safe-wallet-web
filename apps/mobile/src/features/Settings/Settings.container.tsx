import { useGetSafeQuery } from '@safe-global/store/gateway'
import { SafeState } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import { useSelector } from 'react-redux'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { Settings } from './Settings'

export const SettingsContainer = () => {
  const { chainId, address } = useSelector(selectActiveSafe)
  const { data = {} as SafeState } = useGetSafeQuery({
    chainId: chainId,
    safeAddress: address,
  })

  return <Settings address={address} data={data} />
}
