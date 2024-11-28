import { Box, Typography } from '@mui/material'
import classNames from 'classnames'
import css from '@/components/tx-flow/flows/SuccessScreen/styles.module.css'

export const IndexingStatus = () => (
  <Box paddingX={3} mt={3}>
    <Typography data-testid="transaction-status" variant="h6" marginTop={2} fontWeight={700}>
      Transaction was processed
    </Typography>
    <Box className={classNames(css.instructions, css.infoBg)}>
      <Typography variant="body2"> It is now being indexed.</Typography>
    </Box>
  </Box>
)
