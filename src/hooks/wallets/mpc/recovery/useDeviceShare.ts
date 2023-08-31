import type { TorusLoginResponse } from '@toruslabs/customauth'
import type BN from 'bn.js'

import { type Dispatch, type SetStateAction, useEffect, useState, useCallback } from 'react'

export type DeviceShare = {
  factorKey: string
  verifier: string
  verifierId: string
}

export const useDeviceShare = (
  loginResponse: TorusLoginResponse | undefined,
): {
  localFactorKey: BN | null
  setLocalFactorKey: Dispatch<SetStateAction<BN | null>>
  fetchDeviceShare: () => DeviceShare | null
} => {
  const [localFactorKey, setLocalFactorKey] = useState<BN | null>(null)
  const fetchDeviceShare = useCallback(() => {
    if (!loginResponse) {
      return null
    }

    const tKeyLocalStoreString = localStorage.getItem(
      `tKeyLocalStore\u001c${loginResponse.userInfo.verifier}\u001c${loginResponse.userInfo.verifierId}`,
    )
    return tKeyLocalStoreString ? JSON.parse(tKeyLocalStoreString) : null
  }, [loginResponse])

  useEffect(() => {
    if (!localFactorKey || !loginResponse) return
    localStorage.setItem(
      `tKeyLocalStore\u001c${loginResponse.userInfo.verifier}\u001c${loginResponse.userInfo.verifierId}`,
      JSON.stringify({
        factorKey: localFactorKey.toString('hex'),
        verifier: loginResponse.userInfo.verifier,
        verifierId: loginResponse.userInfo.verifierId,
      }),
    )
  }, [localFactorKey, loginResponse])

  return { localFactorKey, setLocalFactorKey, fetchDeviceShare }
}
