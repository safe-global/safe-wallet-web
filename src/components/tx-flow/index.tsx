import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import TxModalDialog from '@/components/common/TxModalDialog'
import { SuccessScreen } from './flows/SuccessScreen'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'

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

const confirmClose = () => {
  return confirm('Closing this window will discard your current progress.')
}

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setFlow] = useState<TxModalContextType['txFlow']>(undefined)
  const [fullWidth, setFullWidth] = useState<boolean>(false)
  const shouldWarn = useRef<boolean>(true)
  const onClose = useRef<() => void>(noop)
  const safeId = useChainId() + useSafeAddress()
  const prevSafeId = useRef<string>(safeId ?? '')
  const pathname = usePathname()
  const prevPathname = useRef<string>(pathname)

  const handleModalClose = useCallback(() => {
    onClose.current()
    onClose.current = noop
    setFlow(undefined)
  }, [])

  const handleShowWarning = useCallback(() => {
    if (shouldWarn.current && !confirmClose()) {
      return
    }
    handleModalClose()
  }, [handleModalClose])

  const setTxFlow = useCallback(
    (newTxFlow: TxModalContextType['txFlow'], newOnClose?: () => void, newShouldWarn?: boolean) => {
      setFlow((prev) => {
        if (prev === newTxFlow) return prev

        // If a new flow is triggered, close the current one
        if (prev && newTxFlow?.type !== SuccessScreen) {
          if (shouldWarn.current && !confirmClose()) {
            return prev
          }
          onClose.current()
        }

        onClose.current = newOnClose ?? noop
        shouldWarn.current = newShouldWarn ?? true

        return newTxFlow
      })
    },
    [],
  )

  // // Close the modal when the Safe changes
  useEffect(() => {
    if (safeId === prevSafeId.current) return
    prevSafeId.current = safeId

    if (txFlow) {
      handleShowWarning()
    }
  }, [txFlow, safeId])

  // // Close the modal when the path changes
  useEffect(() => {
    if (pathname === prevPathname.current) return
    prevPathname.current = pathname

    if (txFlow) {
      handleShowWarning()
    }
  }, [txFlow, pathname])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, setFullWidth }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleShowWarning} fullWidth={fullWidth}>
        {txFlow}
      </TxModalDialog>
    </TxModalContext.Provider>
  )
}
