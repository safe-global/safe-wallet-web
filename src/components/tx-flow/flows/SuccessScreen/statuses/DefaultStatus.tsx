import { Box, Typography } from '@mui/material'
import classNames from 'classnames'
import css from '@/components/tx-flow/flows/SuccessScreen/styles.module.css'
import { isTimeoutError } from '@/utils/ethers-utils'

const TRANSACTION_FAILED = 'Transaction failed'
const TRANSACTION_SUCCESSFUL = 'Transaction was successful'

type Props = {
  error: undefined | Error
}
export const DefaultStatus = ({ error }: Props) => (
  <Box paddingX={3} mt={3}>
    <Typography data-testid="transaction-status" variant="h6" marginTop={2} fontWeight={700}>
      {error ? TRANSACTION_FAILED : TRANSACTION_SUCCESSFUL}
    </Typography>
    {error && (
      <Box className={classNames(css.instructions, error ? css.errorBg : css.infoBg)}>
        <Typography variant="body2">
          {error ? (isTimeoutError(error) ? 'Transaction timed out' : error.message) : ''}
        </Typography>
      </Box>
    )}
  </Box>
)
