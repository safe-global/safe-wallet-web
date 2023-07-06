import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback, type ComponentProps } from 'react'
import { useRouter } from 'next/router'
import TxModalDialog from '@/components/common/TxModalDialog'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectNewTxById, setNewTx, clearNewTx } from '@/store/newTxsSlice'

// All flows
import NewTxMenu from '@/components/tx-flow/flows/NewTx'
import RemoveModuleFlow from '@/components/tx-flow/flows/RemoveModule'
import RemoveGuardFlow from '@/components/tx-flow/flows/RemoveGuard'
import ReplaceOwnerFlow from '@/components/tx-flow/flows/ReplaceOwner'
import RemoveOwnerFlow from '@/components/tx-flow/flows/RemoveOwner'
import AddOwnerFlow from '@/components/tx-flow/flows/AddOwner'
import UpdateSafeFlow from '@/components/tx-flow/flows/UpdateSafe'
import NewSpendingLimitFlow from '@/components/tx-flow/flows/NewSpendingLimit'
import RemoveSpendingLimitFlow from '@/components/tx-flow/flows/RemoveSpendingLimit'
import ChangeThresholdFlow from '@/components/tx-flow/flows/ChangeThreshold'
import TokenTransferFlow from '@/components/tx-flow/flows/TokenTransfer'
import RejectTx from '@/components/tx-flow/flows/RejectTx'
import SuccessScreen from '@/components/tx-flow/flows/SuccessScreen'
import SafeAppsTxFlow from '@/components/tx-flow/flows/SafeAppsTx'
import SignMessageFlow from '@/components/tx-flow/flows/SignMessage'
import SignMessageOnChainFlow from '@/components/tx-flow/flows/SignMessageOnChain'
import ExecuteBatchFlow from '@/components/tx-flow/flows/ExecuteBatch'
import ConfirmTxFlow from '@/components/tx-flow/flows/ConfirmTx'
import ReplaceTxMenu from '@/components/tx-flow/flows/ReplaceTx'
import NftTransferFlow from '@/components/tx-flow/flows/NftTransfer'


const Flows = {
  NewTxMenu,
  RemoveModuleFlow,
  RemoveGuardFlow,
  ReplaceOwnerFlow,
  RemoveOwnerFlow,
  AddOwnerFlow,
  UpdateSafeFlow,
  NewSpendingLimitFlow,
  RemoveSpendingLimitFlow,
  ChangeThresholdFlow,
  TokenTransferFlow,
  RejectTx,
  SuccessScreen,
  SafeAppsTxFlow,
  SignMessageFlow,
  SignMessageOnChainFlow,
  ExecuteBatchFlow,
  ConfirmTxFlow,
  ReplaceTxMenu,
  NftTransferFlow,
}

const noop = () => {}

export type TxFlow<T extends keyof typeof Flows> = {
  component: T
  props?: ComponentProps<typeof Flows[T]>
}

type TxModalContextType = {
  txFlow?: TxFlow
  setTxFlow: (txFlow: TxModalContextType['txFlow'], onClose?: () => void, shouldWarn?: boolean) => void
  setFullWidth: (fullWidth: boolean) => void
}

export const TxModalContext = createContext<TxModalContextType>({
  txFlow: undefined,
  setTxFlow: noop,
  setFullWidth: noop,
})

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [shouldWarn, setShouldWarn] = useState<boolean>(true)
  const [, setOnClose] = useState<Parameters<TxModalContextType['setTxFlow']>[1]>(noop)
  const [fullWidth, setFullWidth] = useState<boolean>(false)
  const router = useRouter()
  const { pathname } = router
  const dispatch = useAppDispatch()
  const txFlow = useAppSelector((state) => selectNewTxById(state, router.query.tx ? pathname : ''))
  const FlowComponent = txFlow ? Flows[txFlow.component] : null

  const setQueryParam = useCallback(
    (tx?: boolean) => {
      const newQuery = { ...router.query }
      if (tx) {
        newQuery.tx = 'true'
      } else {
        delete newQuery.tx
      }
      router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true })
    },
    [router],
  )

  const handleModalClose = useCallback(() => {
    setOnClose((prevOnClose) => {
      prevOnClose?.()
      return noop
    })
    dispatch(clearNewTx(pathname))
    setQueryParam(undefined)
  }, [dispatch, pathname, setOnClose, setQueryParam])

  const handleShowWarning = useCallback(() => {
    if (!shouldWarn) {
      handleModalClose()
      return
    }

    const ok = confirm('Closing this window will discard your current progress.')
    if (!ok) {
      router.events.emit('routeChangeError')
      throw 'routeChange aborted. This error can be safely ignored - https://github.com/zeit/next.js/issues/2476.'
    }

    handleModalClose()
  }, [shouldWarn, handleModalClose, router.events])

  const setTxFlow = useCallback(
    (txFlow: TxModalContextType['txFlow'], onClose?: () => void, shouldWarn?: boolean) => {
      setQueryParam(txFlow ? true : undefined)
      dispatch(txFlow ? setNewTx({ txFlow, id: pathname }) : clearNewTx(pathname))
      setOnClose(() => onClose ?? noop)
      setShouldWarn(shouldWarn ?? true)
    },
    [dispatch, pathname, setOnClose, setQueryParam],
  )

  // Show the confirmation dialog if user navigates
  useEffect(() => {
    if (!txFlow) return

    router.events.on('routeChangeStart', handleShowWarning)
    return () => {
      router.events.off('routeChangeStart', handleShowWarning)
    }
  }, [txFlow, handleShowWarning, router.events])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, setFullWidth }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleShowWarning} fullWidth={fullWidth}>
        {txFlow && <FlowComponent {...txFlow.props} />}
      </TxModalDialog>
    </TxModalContext.Provider>
  )
}
