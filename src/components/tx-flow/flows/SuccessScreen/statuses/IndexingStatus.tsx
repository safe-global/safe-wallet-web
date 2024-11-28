import { Box, Typography } from '@mui/material'
import classNames from 'classnames'
import css from '@/components/tx-flow/flows/SuccessScreen/styles.module.css'

export const IndexingStatus = ({ isSubaccount }: { isSubaccount: boolean }) => (
  <Box
    sx={{
      paddingX: 3,
      mt: 3,
    }}
  >
    <Typography
      data-testid="transaction-status"
      variant="h6"
      sx={{
        marginTop: 2,
        fontWeight: 700,
      }}
    >
      {!isSubaccount ? 'Transaction was processed' : 'Subaccount was created'}
    </Typography>
    <Box className={classNames(css.instructions, css.infoBg)}>
      <Typography variant="body2"> It is now being indexed.</Typography>
    </Box>
  </Box>
)
