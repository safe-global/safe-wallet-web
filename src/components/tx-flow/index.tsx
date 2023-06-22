import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback } from 'react'
import TxModalDialog from '@/components/common/TxModalDialog'
import { useRouter } from 'next/router'

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
  const [onClose, setOnClose] = useState<TxModalContextType['onClose']>(noop)
  const router = useRouter()

  const handleModalClose = useCallback(() => {
    setOnClose((prevOnClose) => {
      prevOnClose?.()
      return noop
    })
    setFlow(undefined)
  }, [setFlow, setOnClose])

  const setTxFlow = useCallback(
    (txFlow: TxModalContextType['txFlow'], onClose?: () => void) => {
      setFlow(txFlow)
      setOnClose(() => onClose ?? noop)
    },
    [setFlow, setOnClose],
  )

  // Close the modal if user navigates
  useEffect(() => {
    router.events.on('routeChangeComplete', handleModalClose)
    return () => router.events.off('routeChangeComplete', handleModalClose)
  }, [router, handleModalClose])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, onClose }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleModalClose}>
        {txFlow}
      </TxModalDialog>
    </TxModalContext.Provider>
  )
}
