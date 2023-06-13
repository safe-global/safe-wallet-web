import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { DialogContent, Typography } from '@mui/material'
import SendToBlock from '@/components/tx/SendToBlock'
import { useContext, useEffect } from 'react'
import { Errors, logError } from '@/services/exceptions'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveModuleTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { type RemoveModuleFlowProps } from '.'

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

  const onFormSubmit = () => {
    trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_MODULE)
  }

  return (
    <DialogContent>
      <SendToBlock address={params.address} title="Module" />
      <Typography my={2}>
        After removing this module, any feature or app that uses this module might no longer work. If this Safe Account
        requires more then one signature, the module removal will have to be confirmed by other owners as well.
      </Typography>
      <SignOrExecuteForm onSubmit={onFormSubmit} />
    </DialogContent>
  )
}
