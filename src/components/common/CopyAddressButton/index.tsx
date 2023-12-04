import type { ReactNode, ReactElement } from 'react'
import CopyButton from '../CopyButton'

const CopyAddressButton = ({
  prefix,
  address,
  copyPrefix,
  children,
}: {
  prefix?: string
  address: string
  copyPrefix?: boolean
  children?: ReactNode
}): ReactElement => {
  const addressText = copyPrefix && prefix ? `${prefix}:${address}` : address

  return <CopyButton text={addressText}>{children}</CopyButton>
}

export default CopyAddressButton
