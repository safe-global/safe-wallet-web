import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback } from 'react'
import TxModalDialog from '@/components/common/TxModalDialog'
import { usePathname } from 'next/navigation'
import useSafeInfo from '@/hooks/useSafeInfo'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { SuccessScreen } from './flows/SuccessScreen'

const noop = () => {}

type TxModalContextType = {
  txFlow: JSX.Element | undefined
  setTxFlow: (txFlow: TxModalContextType['txFlow'], onClose?: () => void, shouldWarn?: boolean) => void
  setFullWidth: (fullWidth: boolean) => void
}

export const TxModalContext = createContext<TxModalContextType>({
  txFlow: undefined,
  setTxFlow: noop,
  setFullWidth: noop,
})

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setFlow] = useState<TxModalContextType['txFlow']>(undefined)
  const [shouldWarn, setShouldWarn] = useState<boolean>(true)
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

    const ok = confirm('Closing this window will discard your current progress.')
    if (!ok) return

    // Reject if the flow is closed
    txDispatch(TxEvent.USER_QUIT, {})

    handleModalClose()
  }, [shouldWarn, handleModalClose])

  const setTxFlow = useCallback(
    (newTxFlow: TxModalContextType['txFlow'], onClose?: () => void, shouldWarn?: boolean) => {
      setFlow((prevFlow) => {
        // Reject if a flow is open and the user changes to a different one
        if (prevFlow && prevFlow !== newTxFlow && newTxFlow?.type !== SuccessScreen) {
          txDispatch(TxEvent.USER_QUIT, {})
        }

        return newTxFlow
      })
      setOnClose(() => onClose ?? noop)
      setShouldWarn(shouldWarn ?? true)
    },
    [],
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
