import { type ReactElement } from 'react'
import { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import CopyButton from '../CopyButton'

const CopyAddressButton = ({ address }: { address: string }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const chain = useCurrentChain()
  const addressText = settings.shortName.copy && chain ? `${chain.shortName}:${address}` : address

  return <CopyButton text={addressText} />
}

export default CopyAddressButton
