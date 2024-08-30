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
    }
  | undefined
> = {
  [NativeStakingStatus.AWAITING_ENTRY]: {
    color: 'info',
    icon: TimelapseIcon,
  },
  [NativeStakingStatus.REQUESTED_EXIT]: {
    color: 'info',
    icon: TimelapseIcon,
  },
  [NativeStakingStatus.SIGNATURE_NEEDED]: {
    color: 'warning',
    icon: SignatureIcon,
  },
  [NativeStakingStatus.AWAITING_EXECUTION]: {
    color: 'warning',
    icon: TimelapseIcon,
  },
  [NativeStakingStatus.VALIDATION_STARTED]: {
    color: 'success',
    icon: CheckIcon,
  },
  [NativeStakingStatus.WITHDRAWN]: {
    color: 'success',
    icon: CheckIcon,
  },
  [NativeStakingStatus.UNKNOWN]: undefined,
}

const StakingStatus = ({ status }: { status: NativeStakingStatus }) => {
  const config = ColorIcons[status]
  const text = status.toLowerCase().replace(/_/g, ' ')

  return (
    <TxStatusChip color={config?.color}>
      {config?.icon && (
        <SvgIcon
          component={config.icon}
          fontSize="inherit"
          viewBox={config.icon === SignatureIcon ? '0 0 16 16' : undefined}
        />
      )}
      {text}
    </TxStatusChip>
  )
}

export default StakingStatus
