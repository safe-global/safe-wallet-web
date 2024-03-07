import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Grid, Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import { Errors, logError } from '@/services/exceptions'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveModuleTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { type RemoveModuleFlowProps } from '.'
import EthHashInfo from '@/components/common/EthHashInfo'

const onFormSubmit = () => {
  trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_MODULE)
}

export const ReviewRemoveModule = ({ params }: { params: RemoveModuleFlowProps }) => {
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createRemoveModuleTx(params.address).then(setSafeTx).catch(setSafeTxError)
  }, [params.address, setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._806, safeTxError.message)
    }
  }, [safeTxError])

  return (
    <SignOrExecuteForm onSubmit={onFormSubmit}>
      <Grid container gap={1} alignItems="center">
        <Grid item xs={2}>
          Module
        </Grid>
        <Typography variant="body2" component="div">
          <EthHashInfo address={params.address} shortAddress={false} hasExplorer showCopyButton />
        </Typography>
      </Grid>
      <Typography my={2}>
        After removing this module, any feature or app that uses this module might no longer work. If this Safe Account
        requires more then one signature, the module removal will have to be confirmed by other signers as well.
      </Typography>
    </SignOrExecuteForm>
  )
}
