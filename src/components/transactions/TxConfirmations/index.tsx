import { Box, Chip, SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import OwnersIcon from '@/public/images/common/owners.svg'

const TxConfirmations = ({
  requiredConfirmations,
  submittedConfirmations,
}: {
  requiredConfirmations: number
  submittedConfirmations: number
}): ReactElement => {
  const color = requiredConfirmations > submittedConfirmations ? 'warning' : 'success'

  return (
    <Chip
      size="small"
      sx={{
        backgroundColor: `${color}.background`,
      }}
      label={
        <Box display="flex" alignItems="center" gap={1}>
          <SvgIcon component={OwnersIcon} inheritViewBox fontSize="small" sx={{ color: `${color}.dark` }} />

          <Typography variant="caption" fontWeight="bold" color={`${color}.dark`}>
            {submittedConfirmations} out of {requiredConfirmations}
          </Typography>
        </Box>
      }
    />
  )
}

export default TxConfirmations
