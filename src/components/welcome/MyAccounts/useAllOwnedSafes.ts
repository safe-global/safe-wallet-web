import { asError } from '@/services/exceptions/utils'
import { useGetAllOwnedSafesQuery } from '@/store/gateway'
import { skipToken } from '@reduxjs/toolkit/query'
import { type AllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo } from 'react'

const useAllOwnedSafes = (address: string | undefined): [AllOwnedSafes, Error | undefined, boolean] => {
  const { data, error, isLoading } = useGetAllOwnedSafesQuery(address ? { address } : skipToken)

  const wrappedError = useMemo(() => (error ? asError(error) : undefined), [error])
  return [data ?? {}, wrappedError, isLoading]
}

export default useAllOwnedSafes
