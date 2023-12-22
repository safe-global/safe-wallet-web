import { createContext, type ReactElement, type ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import TxModalDialog from '@/components/common/TxModalDialog'
import { SuccessScreenFlow } from './flows'
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

// TODO: Rename TxModalProvider, setTxFlow, TxModalDialog to not contain Tx since it can be used for any type of modal as a global provider
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
    if (shouldWarn.current && !confirmClose()) {
      return
    }
    onClose.current()
    onClose.current = noop
    setFlow(undefined)
  }, [])

  // Open a new tx flow, close the previous one if any
  const setTxFlow = useCallback(
    (newTxFlow: TxModalContextType['txFlow'], newOnClose?: () => void, newShouldWarn?: boolean) => {
      setFlow((prev) => {
        if (prev === newTxFlow) return prev

        // If a new flow is triggered, close the current one
        if (prev && newTxFlow && newTxFlow.type !== SuccessScreenFlow) {
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

  // Close the modal when the user navigates to a different Safe or route
  useEffect(() => {
    if (safeId === prevSafeId.current && pathname === prevPathname.current) return

    prevSafeId.current = safeId
    prevPathname.current = pathname

    if (txFlow) {
      handleModalClose()
    }
  }, [txFlow, safeId, pathname, handleModalClose])

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, setFullWidth }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleModalClose} fullWidth={fullWidth}>
        {txFlow}
      </TxModalDialog>
    </TxModalContext.Provider>
  )
}
