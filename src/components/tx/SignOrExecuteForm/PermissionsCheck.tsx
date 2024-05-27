import { useContext, useState } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box, Button, CardActions, CircularProgress, Divider, Typography } from '@mui/material'
import commonCss from '@/components/tx-flow/common/styles.module.css'

import CheckWallet from '@/components/common/CheckWallet'
import WalletRejectionError from './WalletRejectionError'
import TxCard from '@/components/tx-flow/common/TxCard'
import ErrorMessage from '../ErrorMessage'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import useChainId from '@/hooks/useChainId'

const PermissionsCheck: React.FC<{}> = ({}) => {
  const chainId = useChainId()
  const { safeTx, safeTxError } = useContext(SafeTxContext)
  const [isRejectedByUser, setIsRejectedByUser] = useState<boolean>(false)

  const isPending = false
  const isDisabled = isPending

  const handleExecute = async () => {
    setIsRejectedByUser(false)

    const txId = 'TODO'

    // Track tx event
    const txType = await getTransactionTrackingType(chainId, txId)
    trackEvent({ ...TX_EVENTS.EXECUTE_THROUGH_ROLE, label: txType })
  }

  return (
    <TxCard>
      <Typography variant="h5">Execute through role</Typography>

      <Typography>As a member of the Swapper role you can execute this transaction immediately.</Typography>

      {safeTxError && (
        <ErrorMessage error={safeTxError}>
          This transaction will most likely fail. To save gas costs, avoid confirming the transaction.
        </ErrorMessage>
      )}

      {isRejectedByUser && (
        <Box mt={1}>
          <WalletRejectionError />
        </Box>
      )}

      <div>
        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          <CheckWallet allowNonOwner>
            {(isOk) => (
              <Button
                data-testid="execute-through-role-btn"
                variant="contained"
                onClick={handleExecute}
                disabled={!isOk || isDisabled}
                sx={{ minWidth: '209px' }}
              >
                {isPending ? <CircularProgress size={20} /> : 'Execute through role'}
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </div>
    </TxCard>
  )
}

export default PermissionsCheck
