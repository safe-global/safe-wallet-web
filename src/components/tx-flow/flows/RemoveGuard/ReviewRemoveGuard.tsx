import { useContext, useEffect } from 'react'
import { Typography } from '@mui/material'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Errors, logError } from '@/services/exceptions'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveGuardTx } from '@/services/tx/tx-sender'
import { type RemoveGuardFlowProps } from '.'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

export const ReviewRemoveGuard = ({ params }: { params: RemoveGuardFlowProps }) => {
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createRemoveGuardTx().then(setSafeTx).catch(setSafeTxError)
  }, [setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._807, safeTxError.message)
    }
  }, [safeTxError])

  const onFormSubmit = () => {
    trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_GUARD)
  }

  return (
    <SignOrExecuteForm onSubmit={onFormSubmit}>
      <Typography sx={({ palette }) => ({ color: palette.primary.light })}>Transaction guard</Typography>

      <EthHashInfo address={params.address} showCopyButton hasExplorer shortAddress={false} />

      <Typography my={2}>
        Once the transaction guard has been removed, checks by the transaction guard will not be conducted before or
        after any subsequent transactions.
      </Typography>
    </SignOrExecuteForm>
  )
}
