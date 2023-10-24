import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback } from 'react'
import TxModalDialog from '@/components/common/TxModalDialog'
import { usePathname } from 'next/navigation'
import useSafeInfo from '@/hooks/useSafeInfo'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { SuccessScreen } from './flows/SuccessScreen'

const noop = () => {}

export type TxModalContextType = {
  txFlow: JSX.Element | undefined
  setTxFlow: (txFlow: TxModalContextType['txFlow'], onClose?: () => void, shouldWarn?: boolean) => void
  setFullWidth: (fullWidth: boolean) => void
}

export const TxModalContext = createContext<TxModalContextType>({
  txFlow: undefined,
  setTxFlow: noop,
  setFullWidth: noop,
})

const shouldClose = () => confirm('Closing this window will discard your current progress.')

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setFlow] = useState<TxModalContextType['txFlow']>(undefined)
  const [shouldWarn, setShouldWarn] = useState<boolean>(false)
  const [, setOnClose] = useState<Parameters<TxModalContextType['setTxFlow']>[1]>(noop)
  const [fullWidth, setFullWidth] = useState<boolean>(false)
  const pathname = usePathname()
  const [, setLastPath] = useState<string>(pathname)
  const { safeAddress, safe } = useSafeInfo()

  const handleModalClose = useCallback(() => {
    setOnClose((prevOnClose) => {
      prevOnClose?.()
      return noop
    })
    setFlow(undefined)
  }, [setFlow, setOnClose])

  const handleShowWarning = useCallback(() => {
    if (!shouldWarn) {
      handleModalClose()
      return
    }

    if (!shouldClose()) return

    txDispatch(TxEvent.USER_QUIT, {})

    handleModalClose()
  }, [shouldWarn, handleModalClose])

  const setTxFlow = useCallback(
    (newTxFlow: TxModalContextType['txFlow'], onClose?: () => void, newShouldWarn?: boolean) => {
      // If flow is open and user opens a different one, show confirmation dialog if required
      if (txFlow && newTxFlow && newTxFlow?.type !== SuccessScreen && shouldWarn) {
        if (!shouldClose()) return

        txDispatch(TxEvent.USER_QUIT, {})
      }

      setFlow(newTxFlow)
      setOnClose(() => onClose ?? noop)
      setShouldWarn(newShouldWarn ?? true)
    },
    [txFlow, shouldWarn],
  )

  // Show the confirmation dialog if user navigates
  useEffect(() => {
    setLastPath((prev) => {
      if (prev !== pathname && txFlow) {
        handleShowWarning()
      }
      return pathname
    })
  }, [txFlow, handleShowWarning, pathname])

  // Close the modal when the Safe changes
  useEffect(() => {
    handleModalClose()
    // Could have same address but different chain
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe.chainId, safeAddress])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, setFullWidth }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleShowWarning} fullWidth={fullWidth}>
        {txFlow}
      </TxModalDialog>
    </TxModalContext.Provider>
  )
}
