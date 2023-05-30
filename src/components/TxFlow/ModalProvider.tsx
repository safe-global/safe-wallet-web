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
import ModalDialog from '@/components/common/ModalDialog'
import { ReplaceTxMenu, NewTxMenu, RejectTx, TokenTransferFlow } from '@/components/TxFlow'
import { useRouter } from 'next/router'

export enum ModalType {
  SendTokens = 'sendTokens',
  RejectTx = 'rejectTx',
  ReplaceTx = 'replaceTx',
  NewTx = 'newTx',
}

const ModalTypes = {
  [ModalType.SendTokens]: TokenTransferFlow,
  [ModalType.RejectTx]: RejectTx,
  [ModalType.ReplaceTx]: ReplaceTxMenu,
  [ModalType.NewTx]: NewTxMenu,
}

type VisibleModalState<T extends ModalType> = {
  type: T
  props: ComponentProps<typeof ModalTypes[T]>
}

type ContextProps<T extends ModalType> = {
  visibleModal: VisibleModalState<T> | undefined
  setVisibleModal: Dispatch<SetStateAction<VisibleModalState<T> | undefined>>
}

export const ModalContext = createContext<ContextProps<ModalType>>({
  visibleModal: undefined,
  setVisibleModal: () => {},
})

export const ModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [visibleModal, setVisibleModal] = useState<VisibleModalState<ModalType>>()
  const router = useRouter()

  const Component = visibleModal ? ModalTypes[visibleModal.type] : null
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
      <ModalDialog open={!!visibleModal}>
        {/* @ts-ignore TODO: Fix this somehow */}
        {visibleModal && <Component {...props} />}
      </ModalDialog>
    </ModalContext.Provider>
  )
}
