import { useContext, useState } from 'react'
import { type ChainId, chains, fetchRolesMod } from 'zodiac-roles-deployments'

import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box, Button, CardActions, CircularProgress, Divider, Typography } from '@mui/material'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import CheckWallet from '@/components/common/CheckWallet'
import TxCard from '@/components/tx-flow/common/TxCard'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from '@/hooks/useAsync'
import WalletRejectionError from './WalletRejectionError'
import ErrorMessage from '../ErrorMessage'

const PermissionsCheck: React.FC<{}> = ({}) => {
  const chainId = useChainId()
  const { safeTx, safeTxError } = useContext(SafeTxContext)
  const [isRejectedByUser, setIsRejectedByUser] = useState<boolean>(false)

  const rolesMods = useRolesMods()

  //   if (rolesMods.length === 0) {
  //     return null
  //   }

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

const ROLES_V2_SUPPORTED_CHAINS = Object.keys(chains)

/**
 * Returns all Zodiac Roles Modifiers v2 instances that are enabled and correctly configured on this Safe
 */
const useRolesMods = () => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()

  const [data] = useAsync(async () => {
    if (!wallet) return []
    if (!ROLES_V2_SUPPORTED_CHAINS.includes(safe.chainId)) return []

    const safeModules = safe.modules || []
    const rolesMods = await Promise.all(
      safeModules.map((address) =>
        fetchRolesMod({ address: address.value, chainId: parseInt(safe.chainId) as ChainId }),
      ),
    )

    return rolesMods.filter(
      (mod): mod is Exclude<typeof mod, null> =>
        mod !== null &&
        mod.target === safe.address.value.toLowerCase() &&
        mod.avatar === safe.address.value.toLowerCase() &&
        mod.roles.length > 0,
    )
  }, [safe, wallet])

  return data || []
}
