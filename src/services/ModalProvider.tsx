import {
  createContext,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
  useState,
  type ComponentProps,
} from 'react'
import ModalDialog from '@/components/common/ModalDialog'
import TokenTransferFlow from '@/components/new-tx/TokenTransfer/TokenTransferFlow'
import RejectTx from '@/components/new-tx/RejectTx'
import ReplacementModal from '@/components/tx/modals/NewTxModal/ReplacementModal'

export enum ModalType {
  SendTokens = 'sendTokens',
  RejectTx = 'rejectTx',
  ReplaceTx = 'replaceTx',
}

const ModalTypes = {
  [ModalType.SendTokens]: TokenTransferFlow,
  [ModalType.RejectTx]: RejectTx,
  [ModalType.ReplaceTx]: ReplacementModal,
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

  const Component = visibleModal ? ModalTypes[visibleModal.type] : null
  const props = visibleModal ? visibleModal.props : {}

  return (
    <ModalContext.Provider value={{ visibleModal, setVisibleModal }}>
      {children}
      <ModalDialog open={!!visibleModal}>
        {/* @ts-ignore */}
        <Component {...props} />
      </ModalDialog>
    </ModalContext.Provider>
  )
}
