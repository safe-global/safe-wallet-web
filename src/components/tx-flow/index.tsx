import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import TxModalDialog from '@/components/common/TxModalDialog'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectNewTxById, setNewTx, clearNewTx } from '@/store/newTxsSlice'

const Flows = {
  NewTxMenu: require('@/components/tx-flow/flows/NewTx').default,
  RemoveModuleFlow: require('@/components/tx-flow/flows/RemoveModule').default,
  RemoveGuardFlow: require('@/components/tx-flow/flows/RemoveGuard').default,
  ReplaceOwnerFlow: require('@/components/tx-flow/flows/ReplaceOwner').default,
  RemoveOwnerFlow: require('@/components/tx-flow/flows/RemoveOwner').default,
  AddOwnerFlow: require('@/components/tx-flow/flows/AddOwner').default,
  UpdateSafeFlow: require('@/components/tx-flow/flows/UpdateSafe').default,
  NewSpendingLimitFlow: require('@/components/tx-flow/flows/NewSpendingLimit').default,
  RemoveSpendingLimitFlow: require('@/components/tx-flow/flows/RemoveSpendingLimit').default,
  ChangeThresholdFlow: require('@/components/tx-flow/flows/ChangeThreshold').default,
  TokenTransferFlow: require('@/components/tx-flow/flows/TokenTransfer').default,
  RejectTx: require('@/components/tx-flow/flows/RejectTx').default,
  SuccessScreen: require('@/components/tx-flow/flows/SuccessScreen').default,
  SafeAppsTxFlow: require('@/components/tx-flow/flows/SafeAppsTx').default,
  SignMessageFlow: require('@/components/tx-flow/flows/SignMessage').default,
  SignMessageOnChainFlow: require('@/components/tx-flow/flows/SignMessageOnChain').default,
  ExecuteBatchFlow: require('@/components/tx-flow/flows/ExecuteBatch').default,
  ConfirmTxFlow: require('@/components/tx-flow/flows/ConfirmTx').default,
  ReplaceTxMenu: require('@/components/tx-flow/flows/ReplaceTx').default,
  NftTransferFlow: require('@/components/tx-flow/flows/NftTransfer').default,
}

const noop = () => {}

export type TxFlow = {
  component: keyof typeof Flows
  props?: any
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
