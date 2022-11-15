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
  return (
    <>
      <SvgIcon component={OwnersIcon} inheritViewBox fontSize="small" color="border" />
      <Typography
        variant="caption"
        fontWeight="bold"
        color={requiredConfirmations > submittedConfirmations ? 'border.main' : 'primary'}
      >
        {submittedConfirmations} out of {requiredConfirmations}
      </Typography>
    </>
  )
}

export default TxConfirmations
