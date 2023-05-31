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

  // Signed txs cannot be updated
  const isSigned = safeTx && safeTx.signatures.size > 0

  // Recommended nonce and safeTxGas
  const recommendedParams = useRecommendedNonce(safeTx)

  // Priority to external nonce, then to the recommended one
  const finalNonce = nonce ?? recommendedParams?.nonce ?? safeTx?.data.nonce
  const finalSafeTxGas = safeTxGas ?? recommendedParams?.safeTxGas ?? safeTx?.data.safeTxGas

  // Update the tx when the nonce or safeTxGas change
  useEffect(() => {
    if (isSigned || !safeTx?.data) return
    if (safeTx.data.nonce === finalNonce && safeTx.data.safeTxGas === finalSafeTxGas) return

    createTx({ ...safeTx.data, safeTxGas: finalSafeTxGas }, finalNonce)
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [isSigned, finalNonce, finalSafeTxGas, safeTx?.data])

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
