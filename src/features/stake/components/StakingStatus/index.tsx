import { NativeStakingStatus } from '@safe-global/safe-gateway-typescript-sdk'
import { SvgIcon } from '@mui/material'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import CheckIcon from '@mui/icons-material/Check'
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
    icon: TimelapseIcon,
    text: 'Activating',
  },
  [NativeStakingStatus.REQUESTED_EXIT]: {
    color: 'info',
    icon: TimelapseIcon,
    text: 'Requested exit',
  },
  [NativeStakingStatus.SIGNATURE_NEEDED]: {
    color: 'warning',
    icon: SignatureIcon,
    text: 'Signature needed',
  },
  [NativeStakingStatus.AWAITING_EXECUTION]: {
    color: 'warning',
    icon: TimelapseIcon,
    text: 'Awaiting execution',
  },
  [NativeStakingStatus.VALIDATION_STARTED]: {
    color: 'success',
    icon: CheckIcon,
    text: 'Validating',
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
      {config?.icon && (
        <SvgIcon
          component={config.icon}
          fontSize="inherit"
          viewBox={config.icon === SignatureIcon ? '0 0 16 16' : undefined}
        />
      )}
      {config?.text || capitalizedStatus(status)}
    </TxStatusChip>
  )
}

export default StakingStatus
