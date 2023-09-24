import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Errors, logError } from '@/services/exceptions'
import { createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

export function ReviewCancelRecovery({
  delayModifier,
  recovery,
}: {
  delayModifier: Delay
  recovery: TransactionAddedEvent
}): ReactElement {
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    const tx = {
      to: delayModifier.address,
      value: '0',
      data: delayModifier.interface.encodeFunctionData('setTxNonce', [recovery.args.queueNonce.add(1)]),
    }

    createTx(tx).then(setSafeTx).catch(setSafeTxError)
  }, [delayModifier.address, delayModifier.interface, recovery.args.queueNonce, setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._812, safeTxError.message)
    }
  }, [safeTxError])

  return <SignOrExecuteForm onSubmit={() => null} />
}
