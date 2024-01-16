import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import OwnersIcon from '@/public/images/common/owners.svg'
import TxStatusChip from '../TxStatusChip'

const TxConfirmations = ({
  requiredConfirmations,
  submittedConfirmations,
}: {
  requiredConfirmations: number
  submittedConfirmations: number
}): ReactElement => {
  const color = requiredConfirmations > submittedConfirmations ? 'warning' : 'success'

  return (
    <TxStatusChip color={color}>
      <SvgIcon component={OwnersIcon} inheritViewBox fontSize="small" sx={{ color: `${color}.dark` }} />

      <Typography variant="caption" fontWeight="bold" color={`${color}.dark`}>
        {submittedConfirmations} out of {requiredConfirmations}
      </Typography>
    </TxStatusChip>
  )
}

export default TxConfirmations
