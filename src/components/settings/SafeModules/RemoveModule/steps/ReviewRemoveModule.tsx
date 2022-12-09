import useAsync from '@/hooks/useAsync'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import useTxSender from '@/hooks/useTxSender'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { RemoveModuleData } from '@/components/settings/SafeModules/RemoveModule'
import { useEffect } from 'react'
import { Errors, logError } from '@/services/exceptions'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'

export const ReviewRemoveModule = ({
  data,
  onSubmit,
}: {
  data: RemoveModuleData
  onSubmit: (txId: string) => void
}) => {
  const { createRemoveModuleTx } = useTxSender()
  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createRemoveModuleTx(data.address)
  }, [data.address, createRemoveModuleTx])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._806, safeTxError.message)
    }
  }, [safeTxError])

  const onFormSubmit = (txId: string) => {
    trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_MODULE)

    onSubmit(txId)
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onFormSubmit} error={safeTxError}>
      <Typography sx={({ palette }) => ({ color: palette.primary.light })}>Module</Typography>
      <EthHashInfo address={data.address} showCopyButton hasExplorer shortAddress={false} />
      <Typography my={2}>
        After removing this module, any feature or app that uses this module might no longer work. If this Safe requires
        more then one signature, the module removal will have to be confirmed by other owners as well.
      </Typography>
    </SignOrExecuteForm>
  )
}
