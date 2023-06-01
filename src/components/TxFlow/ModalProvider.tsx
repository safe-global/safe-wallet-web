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
import { ReplaceTxMenu, NewTxMenu, RejectTx, TokenTransferFlow, ConfirmProposedTx } from '@/components/TxFlow'
import { useRouter } from 'next/router'
import { SuccessScreen } from '@/components/TxFlow/SuccessScreen'

export enum ModalType {
  SendTokens = 'sendTokens',
  RejectTx = 'rejectTx',
  ReplaceTx = 'replaceTx',
  NewTx = 'newTx',
  ConfirmTx = 'confirmTx',
  SuccessScreen = 'successScreen',
}

const ModalTypes = {
  [ModalType.SendTokens]: TokenTransferFlow,
  [ModalType.RejectTx]: RejectTx,
  [ModalType.ReplaceTx]: ReplaceTxMenu,
  [ModalType.NewTx]: NewTxMenu,
  [ModalType.ConfirmTx]: ConfirmProposedTx,
  [ModalType.SuccessScreen]: SuccessScreen,
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
      <NewModalDialog open={!!visibleModal}>
        {/* @ts-ignore TODO: Fix this somehow */}
        {visibleModal && <Component {...props} />}
      </NewModalDialog>
    </ModalContext.Provider>
  )
}
