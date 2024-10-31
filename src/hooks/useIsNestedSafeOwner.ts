import { useMemo } from 'react'
import { useNestedSafeOwners } from './useNestedSafeOwners'

export const useIsNestedSafeOwner = () => {
  const nestedOwners = useNestedSafeOwners()
  return useMemo(() => nestedOwners && nestedOwners.length > 0, [nestedOwners])
}
