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
}>({
  txFlow: undefined,
  setTxFlow: noop,
})

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setTxFlow] = useState<ReactNode | undefined>()
  const router = useRouter()

  const handleModalClose = useCallback(() => {
    setTxFlow(undefined)
  }, [setTxFlow])

  // Close the modal if user navigates
  useEffect(() => {
    router.events.on('routeChangeComplete', handleModalClose)
    return () => router.events.off('routeChangeComplete', handleModalClose)
  }, [router, handleModalClose])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow }}>
      {children}

      <NewModalDialog open={!!txFlow} onClose={handleModalClose}>
        {txFlow}
      </NewModalDialog>
    </TxModalContext.Provider>
  )
}
