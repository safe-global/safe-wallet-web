import {
  createContext,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
  useState,
  type ComponentProps,
  useEffect,
} from 'react'
import NewModalDialog from '@/components/common/NewModalDialog'
import { useRouter } from 'next/router'

// Flows
import NewTx from '@/components/TxFlow/NewTx'
import SendTokens from '@/components/TxFlow/TokenTransfer/TokenTransferFlow'
import RejectTx from '@/components/TxFlow/RejectTx'
import ReplaceTx from '@/components/TxFlow/ReplaceTx'
import ConfirmTx from '@/components/TxFlow/ConfirmTx'

// Add new tx flows here
const ModalTxFlows = {
  NewTx,
  SendTokens,
  RejectTx,
  ReplaceTx,
  ConfirmTx,
}

type ModalName = keyof typeof ModalTxFlows

export const ModalType = Object.keys(ModalTxFlows).reduce((acc, key) => {
  acc[key as ModalName] = key as ModalName
  return acc
}, {} as Record<ModalName, ModalName>)

type VisibleModalState<T extends ModalName> = {
  type: T
  props: ComponentProps<typeof ModalTxFlows[T]>
}

type ContextProps<T extends ModalName> = {
  visibleModal: VisibleModalState<T> | undefined
  setVisibleModal: Dispatch<SetStateAction<VisibleModalState<T> | undefined>>
}

export const ModalContext = createContext<ContextProps<ModalName>>({
  visibleModal: undefined,
  setVisibleModal: () => {},
})

export const ModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [visibleModal, setVisibleModal] = useState<VisibleModalState<ModalName>>()
  const router = useRouter()

  const Component = visibleModal ? ModalTxFlows[visibleModal.type] : null
  const props = visibleModal ? visibleModal.props : {}

  // Close the modal if user navigates
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      setVisibleModal(undefined)
    })
  }, [router])

  return (
    <ModalContext.Provider value={{ visibleModal, setVisibleModal }}>
      {children}
      <NewModalDialog open={!!visibleModal}>
        {visibleModal && (
          <>
            {/* @ts-ignore TODO: Fix this somehow */}
            <Component {...props} />
          </>
        )}
      </NewModalDialog>
    </ModalContext.Provider>
  )
}
