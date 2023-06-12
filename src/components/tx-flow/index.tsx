import {
  createContext,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
  useState,
  useEffect,
  useCallback,
} from 'react'
import NewModalDialog from '@/components/common/NewModalDialog'
import { useRouter } from 'next/router'

const noop = () => {}

export const TxModalContext = createContext<{
  txFlow: ReactNode | undefined
  setTxFlow: Dispatch<SetStateAction<ReactNode | undefined>>
  onClose: () => void
  setOnClose: Dispatch<SetStateAction<() => void>>
}>({
  txFlow: undefined,
  setTxFlow: noop,
  onClose: noop,
  setOnClose: noop,
})

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setTxFlow] = useState<ReactNode | undefined>()
  const [onClose, setOnClose] = useState<() => void>(noop)
  const router = useRouter()

  const handleModalClose = useCallback(() => {
    setTxFlow(undefined)
  }, [setTxFlow])

  // Close the modal if user navigates
  useEffect(() => {
    router.events.on('routeChangeComplete', handleModalClose)
    return () => router.events.off('routeChangeComplete', handleModalClose)
  }, [router, handleModalClose])

  // On close callback
  useEffect(() => {
    if (!txFlow) {
      setOnClose((prevOnClose) => {
        prevOnClose?.()
        return noop
      })
    }
  }, [txFlow])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, onClose, setOnClose }}>
      {children}

      <NewModalDialog open={!!txFlow} onClose={handleModalClose}>
        {txFlow}
      </NewModalDialog>
    </TxModalContext.Provider>
  )
}
