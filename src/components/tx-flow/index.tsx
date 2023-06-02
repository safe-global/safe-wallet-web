import {
  createContext,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
  useState,
  useEffect,
} from 'react'
import NewModalDialog from '@/components/common/NewModalDialog'
import { useRouter } from 'next/router'

export const TxModalContext = createContext<{
  txFlow: ReactNode | undefined
  setTxFlow: Dispatch<SetStateAction<ReactNode | undefined>>
}>({
  txFlow: undefined,
  setTxFlow: () => {},
})

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setTxFlow] = useState<ReactNode | undefined>()
  const router = useRouter()

  // Close the modal if user navigates
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      setTxFlow(undefined)
    })
  }, [router])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow }}>
      {children}

      <NewModalDialog open={!!txFlow}>{txFlow}</NewModalDialog>
    </TxModalContext.Provider>
  )
}
