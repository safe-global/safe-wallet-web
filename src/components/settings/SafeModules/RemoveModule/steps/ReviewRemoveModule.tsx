import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { createTx } from '@/services/tx/txSender'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { RemoveModuleData } from '@/components/settings/SafeModules/RemoveModule'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { useEffect } from 'react'
import { Errors, logError } from '@/services/exceptions'

export const ReviewRemoveModule = ({ data, onSubmit }: { data: RemoveModuleData; onSubmit: (data: null) => void }) => {
  const { safe } = useSafeInfo()
  const sdk = useSafeSDK()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return sdk?.getDisableModuleTx(data.address).then((tx) => createTx(tx.data))
  }, [sdk, data.address])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._806, safeTxError.message)
    }
  }, [safeTxError])

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onSubmit} error={safeTxError}>
      <Typography sx={({ palette }) => ({ color: palette.secondary.light })}>Module</Typography>
      <EthHashInfo address={data.address} showCopyButton hasExplorer shortAddress={false} />
      <Typography my={2}>
        After removing this module, any feature or app that uses this module might no longer work. If this Safe requires
        more then one signature, the module removal will have to be confirmed by other owners as well.
      </Typography>
    </SignOrExecuteForm>
  )
}
