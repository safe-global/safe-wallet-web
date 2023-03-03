import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import OwnersIcon from '@/public/images/common/owners.svg'

const TxConfirmations = ({
  requiredConfirmations,
  submittedConfirmations,
}: {
  requiredConfirmations: number
  submittedConfirmations: number
}): ReactElement => {
  const confirmationColor = requiredConfirmations > submittedConfirmations ? 'border' : 'primary'

  return (
    <>
      <SvgIcon component={OwnersIcon} inheritViewBox fontSize="small" color={confirmationColor} />
      <Typography variant="caption" fontWeight="bold" color={confirmationColor}>
        {submittedConfirmations} out of {requiredConfirmations}
      </Typography>
    </>
  )
}

export default TxConfirmations
