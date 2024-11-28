import { useEffect } from 'react'
import { useGetSafeQuery } from '@/src/store/gateway'
import { SafeState } from '@/src/store/gateway/AUTO_GENERATED/safes'
import { useNavigation } from 'expo-router'
import { useSelector } from 'react-redux'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import SettingsPresentation from './Settings'

export const SettingsContainer = () => {
  const navigation = useNavigation()
  const { chainId, address } = useSelector(selectActiveSafe)
  const { data = {} as SafeState } = useGetSafeQuery({
    chainId: chainId,
    safeAddress: address,
  })

  useEffect(() => {
    navigation.setParams({
      safeAddress: address,
    })
  }, [address])

  return <SettingsPresentation address={address} data={data} />
}
