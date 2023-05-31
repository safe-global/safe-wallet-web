import { createContext, useState, useEffect } from 'react'
import type { Dispatch, ReactNode, SetStateAction, ReactElement } from 'react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createTx } from '@/services/tx/tx-sender'
import { useRecommendedNonce } from '../tx/SignOrExecuteForm/hooks'

export const SafeTxContext = createContext<{
  safeTx?: SafeTransaction
  setSafeTx: Dispatch<SetStateAction<SafeTransaction | undefined>>

  safeTxError?: Error
  setSafeTxError: Dispatch<SetStateAction<Error | undefined>>

  nonce?: number
  setNonce: Dispatch<SetStateAction<number | undefined>>

  safeTxGas?: number
  setSafeTxGas: Dispatch<SetStateAction<number | undefined>>
}>({
  setSafeTx: () => {},
  setSafeTxError: () => {},
  setNonce: () => {},
  setSafeTxGas: () => {},
})

// (err) => logError(Errors._103, (err as Error).message)

const SafeTxProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [safeTx, setSafeTx] = useState<SafeTransaction>()
  const [safeTxError, setSafeTxError] = useState<Error>()
  const [nonce, setNonce] = useState<number>()
  const [safeTxGas, setSafeTxGas] = useState<number>()

  // Recommended nonce and safeTxGas
  const recommendedParams = useRecommendedNonce(safeTx)
  const nonceReadonly = !safeTx || safeTx.signatures.size > 0 || nonce !== undefined

  // Update the tx when the recommended nonce/safeTx change
  useEffect(() => {
    if (nonceReadonly || !safeTx?.data) return
    if (!recommendedParams?.nonce || !recommendedParams?.safeTxGas) return
    if (safeTx.data.nonce === recommendedParams?.nonce && safeTx.data.safeTxGas === recommendedParams?.safeTxGas) return

    createTx({ ...safeTx.data, safeTxGas: recommendedParams.safeTxGas }, recommendedParams.nonce)
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [nonceReadonly, safeTx?.data, recommendedParams?.nonce, recommendedParams?.safeTxGas])

  // Update the tx when the nonce/safeTxGas change from outside
  useEffect(() => {
    if (!safeTx?.data) return
    if (safeTx.data.nonce === nonce && safeTx.data.safeTxGas === safeTxGas) return

    createTx({ ...safeTx.data, safeTxGas }, nonce)
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [safeTx?.data, nonce, safeTxGas])

  return (
    <SafeTxContext.Provider
      value={{
        safeTx,
        safeTxError,
        setSafeTx,
        setSafeTxError,
        nonce,
        setNonce,
        safeTxGas,
        setSafeTxGas,
      }}
    >
      {children}
    </SafeTxContext.Provider>
  )
}

export default SafeTxProvider
