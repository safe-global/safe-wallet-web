import { useState, useCallback } from 'react'
import type { EIP712TypedData } from '@gnosis.pm/safe-apps-sdk'
import { Methods } from '@gnosis.pm/safe-apps-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'

type StateType = {
  isOpen: boolean
  message: string | EIP712TypedData
  requestId: string
  method: Methods
  offChain: boolean
}

const INITIAL_MODAL_STATE: StateType = {
  isOpen: false,
  message: '',
  requestId: '',
  method: Methods.signMessage,
  offChain: false,
}

type ReturnType = [
  StateType,
  (
    message: string | EIP712TypedData,
    requestId: string,
    method: Methods.signMessage | Methods.signTypedMessage,
  ) => void,
  () => void,
]

const useSignMessageModal = (): ReturnType => {
  const { safe } = useSafeInfo()
  const offChain = safe.threshold === 1

  const [signMessageModalState, setSignMessageModalState] = useState<StateType>({ ...INITIAL_MODAL_STATE, offChain })

  const openSignMessageModal = useCallback(
    (message: string | EIP712TypedData, requestId: string, method: Methods) => {
      setSignMessageModalState({
        ...INITIAL_MODAL_STATE,
        isOpen: true,
        message,
        requestId,
        method,
        offChain,
      })
    },
    [offChain],
  )

  const closeSignMessageModal = useCallback(() => {
    setSignMessageModalState(INITIAL_MODAL_STATE)
  }, [])

  return [signMessageModalState, openSignMessageModal, closeSignMessageModal]
}

export default useSignMessageModal
