import { useEffect } from 'react'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch } from 'store'
import { setSafeInfo } from 'store/safeInfoSlice'
import { initSafeInfoService } from 'services/safeInfoService'
import useSafeAddress from './useSafeAddress'

const useSafeInfo = (): void => {
  const { address, chainId } = useSafeAddress()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!address || !chainId) return

    const { onSuccess, onError, unsubscribe } = initSafeInfoService(chainId, address)

    const handleSuccess = (data: SafeInfo) => {
      dispatch(setSafeInfo(data))
    }

    const handleError = (error: Error) => {
      console.error('Error loading Safe info', error)
    }

    onSuccess(handleSuccess)
    onError(handleError)

    return () => {
      unsubscribe()
    }
  }, [dispatch, address, chainId])
}

export default useSafeInfo
