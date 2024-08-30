import { NativeStakingStatus } from '@safe-global/safe-gateway-typescript-sdk'
import { SvgIcon } from '@mui/material'
import CheckIcon from '@/public/images/common/circle-check.svg'
import ClockIcon from '@/public/images/common/clock.svg'
import SignatureIcon from '@/public/images/common/document_signature.svg'
import TxStatusChip, { type TxStatusChipProps } from '@/components/transactions/TxStatusChip'

const ColorIcons: Record<
  NativeStakingStatus,
  | {
      color: TxStatusChipProps['color']
      icon?: React.ComponentType
      text: string
    }
  | undefined
> = {
  [NativeStakingStatus.AWAITING_ENTRY]: {
    color: 'info',
    icon: ClockIcon,
    text: 'Activating',
  },
  [NativeStakingStatus.REQUESTED_EXIT]: {
    color: 'info',
    icon: ClockIcon,
    text: 'Requested exit',
  },
  [NativeStakingStatus.SIGNATURE_NEEDED]: {
    color: 'warning',
    icon: SignatureIcon,
    text: 'Signature needed',
  },
  [NativeStakingStatus.AWAITING_EXECUTION]: {
    color: 'warning',
    icon: ClockIcon,
    text: 'Awaiting execution',
  },
  [NativeStakingStatus.VALIDATION_STARTED]: {
    color: 'success',
    icon: CheckIcon,
    text: 'Validation started',
  },
  [NativeStakingStatus.WITHDRAWN]: {
    color: 'success',
    icon: CheckIcon,
    text: 'Withdrawn',
  },
  [NativeStakingStatus.UNKNOWN]: undefined,
}

const capitalizedStatus = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/g, (l) => l.toUpperCase())

const StakingStatus = ({ status }: { status: NativeStakingStatus }) => {
  const config = ColorIcons[status]

  return (
    <TxStatusChip color={config?.color}>
      {config?.icon && <SvgIcon component={config.icon} fontSize="inherit" inheritViewBox />}
      {config?.text || capitalizedStatus(status)}
    </TxStatusChip>
  )
}

export default StakingStatus
