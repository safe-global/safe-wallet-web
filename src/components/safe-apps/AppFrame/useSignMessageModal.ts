import { useState, useCallback } from 'react'
import { Methods } from '@gnosis.pm/safe-apps-sdk'

type StateType = { isOpen: boolean; message: string; requestId: string; method: Methods }

const INITIAL_MODAL_STATE: StateType = {
  isOpen: false,
  message: '',
  requestId: '',
  method: Methods.signMessage,
}

type ReturnType = [StateType, (message: string, requestId: string, method: Methods) => void, () => void]

export const useSignMessageModal = (): ReturnType => {
  const [signMessageModalState, setSignMessageModalState] = useState<StateType>(INITIAL_MODAL_STATE)

  const openSignMessageModal = useCallback((message: string, requestId: string, method: Methods) => {
    setSignMessageModalState({
      ...INITIAL_MODAL_STATE,
      isOpen: true,
      message,
      requestId,
      method,
    })
  }, [])

  const closeSignMessageModal = useCallback(() => {
    setSignMessageModalState(INITIAL_MODAL_STATE)
  }, [])

  return [signMessageModalState, openSignMessageModal, closeSignMessageModal]
}
