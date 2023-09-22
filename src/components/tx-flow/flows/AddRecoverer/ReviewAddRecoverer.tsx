import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Errors, logError } from '@/services/exceptions'
import { createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import type { AddRecovererFlowProps } from '.'

export function ReviewAddRecoverer({
  delayModifier,
  params,
}: {
  delayModifier: Delay
  params: AddRecovererFlowProps
}): ReactElement {
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    const tx = {
      to: delayModifier.address,
      value: '0',
      data: delayModifier.interface.encodeFunctionData('enableModule', [params.recoverer]),
    }

    createTx(tx).then(setSafeTx).catch(setSafeTxError)
  }, [delayModifier.address, delayModifier.interface, params.recoverer, setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._810, safeTxError.message)
    }
  }, [safeTxError])

  return <SignOrExecuteForm onSubmit={() => null} />
}
