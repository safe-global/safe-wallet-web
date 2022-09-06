import { type ReactElement } from 'react'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import CopyButton from '../CopyButton'

const CopyAddressButton = ({ prefix, address }: { prefix?: string; address: string }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const addressText = settings.shortName.copy && prefix ? `${prefix}:${address}` : address

  return <CopyButton text={addressText} />
}

export default CopyAddressButton
