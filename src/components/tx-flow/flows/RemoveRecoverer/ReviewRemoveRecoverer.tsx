import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Errors, logError } from '@/services/exceptions'
import { createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import type { Delay } from '@gnosis.pm/zodiac'
import { sameAddress } from '@/utils/addresses'
import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { MODULE_PAGE_SIZE } from '@/services/recovery/delay-modifier'

export function ReviewRemoveRecoverer({
  delayModifier,
  recoverer,
}: {
  delayModifier: Delay
  recoverer: string
}): ReactElement {
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    delayModifier.getModulesPaginated(SENTINEL_ADDRESS, MODULE_PAGE_SIZE).then(([modules]) => {
      const moduleIndex = modules.findIndex((module) => {
        return sameAddress(module, recoverer)
      })

      if (moduleIndex === -1) {
        throw new Error('Module not found')
      }

      const prevModule = moduleIndex === 0 ? SENTINEL_ADDRESS : modules[moduleIndex - 1]

      const tx = {
        to: delayModifier.address,
        value: '0',
        data: delayModifier.interface.encodeFunctionData('disableModule', [prevModule, recoverer]),
      }

      createTx(tx).then(setSafeTx).catch(setSafeTxError)
    })
  }, [delayModifier, delayModifier.address, delayModifier.interface, recoverer, setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._811, safeTxError.message)
    }
  }, [safeTxError])

  return <SignOrExecuteForm onSubmit={() => null} />
}
