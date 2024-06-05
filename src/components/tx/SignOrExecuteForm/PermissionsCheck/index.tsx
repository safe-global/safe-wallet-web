import { useContext, useState } from 'react'
import { Status } from 'zodiac-roles-deployments'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { decodeBytes32String } from 'ethers'

import { Box, Button, CardActions, Chip, CircularProgress, Divider, Typography } from '@mui/material'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import CheckWallet from '@/components/common/CheckWallet'
import TxCard from '@/components/tx-flow/common/TxCard'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import useSafeInfo from '@/hooks/useSafeInfo'
import WalletRejectionError from '../WalletRejectionError'
import ErrorMessage from '../../ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import { type SubmitCallback } from '..'
import { getTxOptions } from '@/utils/transactions'
import { isWalletRejection } from '@/utils/wallets'
import { Errors, trackError } from '@/services/exceptions'
import { asError } from '@/services/exceptions/utils'
import { SuccessScreenFlow } from '@/components/tx-flow/flows'
import AdvancedParams, { useAdvancedParams } from '../../AdvancedParams'
import { useCurrentChain } from '@/hooks/useChains'
import { dispatchModuleTxExecution } from '@/services/tx/tx-sender'
import useOnboard from '@/hooks/wallets/useOnboard'
import { assertOnboard, assertWallet } from '@/utils/helpers'
import { TxModalContext } from '@/components/tx-flow'
import { pollModuleTransactionId, useExecuteThroughRole, useRoles, useGasLimit } from './hooks'
import { assertWalletChain } from '@/services/tx/tx-sender/sdk'

const Role = ({ children }: { children: string }) => {
  let humanReadableRoleKey = children
  try {
    humanReadableRoleKey = decodeBytes32String(children)
  } catch (e) {}

  return <Chip label={humanReadableRoleKey} />
}

const PermissionsCheck: React.FC<{ onSubmit?: SubmitCallback; safeTx: SafeTransaction; safeTxError?: Error }> = ({
  onSubmit,
  safeTx,
  safeTxError,
}) => {
  const currentChain = useCurrentChain()
  const onboard = useOnboard()
  const wallet = useWallet()
  const { safe } = useSafeInfo()

  const chainId = currentChain?.chainId || '1'

  const [isPending, setIsPending] = useState<boolean>(false)
  const [isRejectedByUser, setIsRejectedByUser] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  const { setTxFlow } = useContext(TxModalContext)

  const roles = useRoles(safeTx?.data)
  const allowingRole = roles.find((role) => role.status === Status.Ok)

  // If a user has multiple roles, we should prioritize the one that allows the transaction's to address (and function selector)
  const mostLikelyRole =
    allowingRole ||
    roles.find((role) => role.status !== Status.TargetAddressNotAllowed && role.status !== Status.FunctionNotAllowed) ||
    roles.find((role) => role.status !== Status.TargetAddressNotAllowed) ||
    roles[0]

  // Wrap call routing it through the Roles mod with the allowing role
  const txThroughRole = useExecuteThroughRole({
    modAddress: allowingRole?.modAddress,
    roleKey: allowingRole?.roleKey,
    metaTx: safeTx?.data,
  })
  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(txThroughRole)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  const handleExecute = async () => {
    assertWallet(wallet)
    assertOnboard(onboard)

    await assertWalletChain(onboard, chainId)

    setIsRejectedByUser(false)
    setIsPending(true)
    setSubmitError(undefined)
    setIsRejectedByUser(false)

    if (!txThroughRole) {
      throw new Error('Execution through role is not possible')
    }

    const txOptions = getTxOptions(advancedParams, currentChain)

    let txHash: string
    try {
      txHash = await dispatchModuleTxExecution({ ...txThroughRole, ...txOptions }, wallet.provider, safe.address.value)
    } catch (_err) {
      const err = asError(_err)
      if (isWalletRejection(err)) {
        setIsRejectedByUser(true)
      } else {
        trackError(Errors._815, err)
        setSubmitError(err)
      }
      setIsPending(false)
      return
    }

    // On success, forward to the success screen, initially without a txId
    setTxFlow(<SuccessScreenFlow txHash={txHash} />, undefined, false)

    // Wait for module tx to be indexed
    const transactionService = currentChain?.transactionService
    if (!transactionService) {
      throw new Error('Transaction service not found')
    }
    const moduleTxId = await pollModuleTransactionId({
      transactionService,
      safeAddress: safe.address.value,
      txHash,
    })

    const txId = `module_${safe.address.value}_${moduleTxId}`

    onSubmit?.(txId, true)

    // Track tx event
    const txType = await getTransactionTrackingType(chainId, txId)
    trackEvent({ ...TX_EVENTS.EXECUTE_THROUGH_ROLE, label: txType })

    // Update the success screen so it shows a link to the transaction
    setTxFlow(<SuccessScreenFlow txId={txId} />, undefined, false)
  }

  // Only render the card if the connected wallet is a member of any role
  if (roles.length === 0) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5">Execute without confirmations</Typography>

      {allowingRole && (
        <>
          <Typography component="div">
            As a member of the <Role>{allowingRole.roleKey}</Role> you can execute this transaction immediately without
            confirmations from other owners.
          </Typography>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
          />
        </>
      )}

      {!allowingRole && (
        <>
          <Typography component="div">
            You are a member of the <Role>{mostLikelyRole.roleKey}</Role> role but it does not allow this transaction.
          </Typography>

          {mostLikelyRole.status && (
            <ErrorMessage>
              The permission check fails with the following status:
              <br />
              <code>{Status[mostLikelyRole.status]}</code>
            </ErrorMessage>
          )}
        </>
      )}

      {safeTxError && (
        <ErrorMessage error={safeTxError}>
          This transaction will most likely fail. To save gas costs, avoid confirming the transaction.
        </ErrorMessage>
      )}

      {submitError && (
        <Box mt={1}>
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        </Box>
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
                disabled={!isOk || !allowingRole || isPending}
                sx={{ minWidth: '209px' }}
              >
                {isPending ? <CircularProgress size={20} /> : 'Execute'}
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </div>
    </TxCard>
  )
}

export default PermissionsCheck
