import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback } from 'react'
import TxModalDialog from '@/components/common/TxModalDialog'
import { useRouter } from 'next/router'
import { TxFlowExitWarning } from '@/components/tx-flow/common/TxFlowExitWarning'

const noop = () => {}

type TxModalContextType = {
  txFlow: ReactNode | undefined
  setTxFlow: (txFlow: TxModalContextType['txFlow'], onClose?: () => void) => void
  onClose: () => void
}

export const TxModalContext = createContext<TxModalContextType>({
  txFlow: undefined,
  setTxFlow: noop,
  onClose: noop,
})

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setFlow] = useState<TxModalContextType['txFlow']>(undefined)
  const [showWarning, setShowWarning] = useState(false)
  const [onClose, setOnClose] = useState<TxModalContextType['onClose']>(noop)
  const router = useRouter()

  const handleShowWarning = useCallback(() => {
    setShowWarning(true)
  }, [setShowWarning])

  const handleCloseWarning = useCallback(() => {
    setShowWarning(false)
  }, [setShowWarning])

  const handleExitFlow = useCallback(() => {
    setOnClose((prevOnClose) => {
      prevOnClose?.()
      return noop
    })
    handleCloseWarning()
    setFlow(undefined)
  }, [handleCloseWarning, setFlow, setOnClose])

  const setTxFlow = useCallback(
    (txFlow: TxModalContextType['txFlow'], onClose?: () => void) => {
      setFlow(txFlow)
      setOnClose(() => onClose ?? noop)
    },
    [setFlow, setOnClose],
  )

  // Show the modal if user navigates
  useEffect(() => {
    if (!txFlow) {
      return
    }

    router.events.on('beforeHistoryChange', handleShowWarning) // Back button
    router.events.on('routeChangeStart', handleShowWarning) // Navigation
    return () => {
      router.events.off('beforeHistoryChange', handleShowWarning)
      router.events.off('routeChangeStart', handleShowWarning)
    }
  }, [txFlow, router, handleShowWarning])

  return (
    <>
      <TxModalContext.Provider value={{ txFlow, setTxFlow, onClose }}>
        {children}

        <TxModalDialog open={!!txFlow} onClose={handleShowWarning}>
          {txFlow}
        </TxModalDialog>
      </TxModalContext.Provider>

      <TxFlowExitWarning open={showWarning} onCancel={handleCloseWarning} onClose={handleExitFlow} />
    </>
  )
}
