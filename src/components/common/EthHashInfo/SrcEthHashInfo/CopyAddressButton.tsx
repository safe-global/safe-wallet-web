import CopyButton from '../../CopyButton'

type CopyAddressButtonProps = {
  prefix?: string
  address: string
  copyPrefix?: boolean
}

const CopyAddressButton = ({ prefix, address, copyPrefix }: CopyAddressButtonProps): React.ReactElement => {
  const addressText = copyPrefix && prefix ? `${prefix}:${address}` : address
  return <CopyButton text={addressText} />
}

export default CopyAddressButton
