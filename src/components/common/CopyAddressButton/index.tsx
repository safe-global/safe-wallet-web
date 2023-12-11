import type { ReactNode, ReactElement } from 'react'
import CopyButton from '../CopyButton'
import CopyUntrustedAddressModal from './CopyUntrustedAddressModal'

const CopyAddressButton = ({
  prefix,
  address,
  copyPrefix,
  children,
  trusted,
}: {
  prefix?: string
  address: string
  copyPrefix?: boolean
  children?: ReactNode
  trusted?: boolean
}): ReactElement => {
  const addressText = copyPrefix && prefix ? `${prefix}:${address}` : address

  return (
    <CopyButton text={addressText} trusted={trusted} ConfirmationModal={CopyUntrustedAddressModal}>
      {children}
    </CopyButton>
  )
}

export default CopyAddressButton
