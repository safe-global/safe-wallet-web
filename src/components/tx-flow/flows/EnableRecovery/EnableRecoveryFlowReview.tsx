import { useContext, useEffect, useMemo } from 'react'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Errors, logError } from '@/services/exceptions'
import { createMultiSendCallOnlyTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { getRecoverySetup } from '@/services/recovery/setup'
import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { EnableRecoveryFlowProps } from '.'

export function EnableRecoveryFlowReview({ params }: { params: EnableRecoveryFlowProps }): ReactElement {
  const web3 = useWeb3()
  const { safe } = useSafeInfo()
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  const recoverySetup = useMemo(() => {
    if (!web3) {
      return
    }

    return getRecoverySetup({
      ...params,
      safe,
      provider: web3,
    })
  }, [params, safe, web3])

  useEffect(() => {
    if (recoverySetup) {
      createMultiSendCallOnlyTx(recoverySetup.transactions).then(setSafeTx).catch(setSafeTxError)
    }
  }, [recoverySetup, setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._809, safeTxError.message)
    }
  }, [safeTxError])

  return <SignOrExecuteForm onSubmit={() => null} />
}
