import { type ReactElement } from 'react'

import CopyButton from '../CopyButton'

const CopyAddressButton = ({
  prefix,
  address,
  copyPrefix,
}: {
  prefix?: string
  address: string
  copyPrefix?: boolean
}): ReactElement => {
  const addressText = copyPrefix && prefix ? `${prefix}:${address}` : address

  return <CopyButton text={addressText} />
}

export default CopyAddressButton
