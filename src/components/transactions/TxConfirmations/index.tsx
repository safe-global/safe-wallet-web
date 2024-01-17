import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import OwnersIcon from '@/public/images/common/owners.svg'
import TxStatusChip from '../TxStatusChip'

const TxConfirmations = ({
  requiredConfirmations,
  submittedConfirmations,
}: {
  requiredConfirmations: number
  submittedConfirmations: number
}): ReactElement => {
  const isConfirmed = submittedConfirmations >= requiredConfirmations
  const color = isConfirmed ? 'success' : 'warning'

  return (
    <TxStatusChip color={color}>
      <SvgIcon component={isConfirmed ? CheckIcon : OwnersIcon} inheritViewBox fontSize="small" />

      <Typography variant="caption" fontWeight="bold">
        {submittedConfirmations} out of {requiredConfirmations}
      </Typography>
    </TxStatusChip>
  )
}

export default TxConfirmations
