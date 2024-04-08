import { Skeleton } from '@mui/material'

const WalletIcon = ({
  provider,
  width = 30,
  height = 30,
  icon,
}: {
  provider: string
  width?: number
  height?: number
  icon?: string
}) => {
  return icon ? (
    <img width={width} height={height} src={icon} alt={`${provider} logo`} />
  ) : (
    <Skeleton variant="circular" width={width} height={height} />
  )
}

export default WalletIcon
