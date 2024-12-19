import { Box, SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import RecoveryPlusIcon from '@/public/images/common/recovery-plus.svg'

import txTypeCss from '@/components/transactions/TxType/styles.module.css'

export function RecoveryType({ isMalicious }: { isMalicious: boolean }): ReactElement {
  return (
    <Box className={txTypeCss.txType}>
      <SvgIcon
        component={RecoveryPlusIcon}
        inheritViewBox
        fontSize="inherit"
        sx={{ '& path': { fill: ({ palette }) => palette.warning.main } }}
      />
      <Typography color={isMalicious ? 'error.main' : undefined}>
        {isMalicious ? 'Malicious transaction' : 'Account recovery'}
      </Typography>
    </Box>
  )
}
