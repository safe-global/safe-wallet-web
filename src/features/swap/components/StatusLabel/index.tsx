import { Chip as MuiChip, SvgIcon } from '@mui/material'
import type { OrderStatuses } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import CheckIcon from '@/public/images/common/circle-check.svg'
import ClockIcon from '@/public/images/common/clock.svg'
import BlockIcon from '@/public/images/common/block.svg'
import SignatureIcon from '@/public/images/common/document_signature.svg'

type Props = {
  status: OrderStatuses
}

type StatusProps = {
  label: string
  color: string
  backgroundColor: string
  iconColor: string
  icon: any
}

const statusMap: Record<OrderStatuses, StatusProps> = {
  presignaturePending: {
    label: 'Execution needed',
    color: 'warning.main',
    backgroundColor: 'warning.background',
    iconColor: 'warning.main',
    icon: SignatureIcon,
  },
  fulfilled: {
    label: 'Filled',
    color: 'success.dark',
    backgroundColor: 'secondary.background',
    iconColor: 'success.dark',
    icon: CheckIcon,
  },
  open: {
    label: 'Open',
    color: 'warning.main',
    backgroundColor: 'warning.background',
    iconColor: 'warning.main',
    icon: ClockIcon,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'error.dark',
    backgroundColor: 'error.background',
    iconColor: 'error.dark',
    icon: BlockIcon,
  },
  expired: {
    label: 'Expired',
    color: 'primary.light',
    backgroundColor: 'background.main',
    iconColor: 'border.main',
    icon: ClockIcon,
  },
}
export const StatusLabel = (props: Props): ReactElement => {
  const { status } = props
  const { label, color, icon, iconColor, backgroundColor } = statusMap[status]

  return (
    <MuiChip
      label={label}
      size="small"
      sx={{
        fontWeight: 800,
        backgroundColor,
        color,
        '& .MuiChip-icon': { color: iconColor },
      }}
      icon={<SvgIcon component={icon} inheritViewBox />}
    />
  )
}

export default StatusLabel
