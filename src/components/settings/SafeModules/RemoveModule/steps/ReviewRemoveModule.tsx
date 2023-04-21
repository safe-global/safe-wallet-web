import useAsync from '@/hooks/useAsync'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Typography } from '@mui/material'
import SendToBlock from '@/components/tx/SendToBlock'
import type { RemoveModuleData } from '@/components/settings/SafeModules/RemoveModule'
import { useEffect } from 'react'
import { Errors, logError } from '@/services/exceptions'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveModuleTx } from '@/services/tx/tx-sender'

export const ReviewRemoveModule = ({ data, onSubmit }: { data: RemoveModuleData; onSubmit: () => void }) => {
  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createRemoveModuleTx(data.address)
  }, [data.address])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._806, safeTxError.message)
    }
  }, [safeTxError])

  const onFormSubmit = () => {
    trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_MODULE)

    onSubmit()
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onFormSubmit} error={safeTxError}>
      <SendToBlock address={data.address} title="Module" />
      <Typography my={2}>
        After removing this module, any feature or app that uses this module might no longer work. If this Safe Account
        requires more then one signature, the module removal will have to be confirmed by other owners as well.
      </Typography>
    </SignOrExecuteForm>
  )
}
