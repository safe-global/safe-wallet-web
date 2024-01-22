import React, { useCallback, useMemo, useState } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import useAllOwnedSafes from '@/hooks/useOwnedSafes'
import { Button } from '@mui/material'

const maxSafes = 5

const Login = () => {
  const [lastChainId, setLastChainId] = useState<string | undefined>()
  const [safes] = useAllOwnedSafes(lastChainId ? Infinity : maxSafes, lastChainId)

  const safesToShow = useMemo(() => {
    return [safes.slice(0, maxSafes), safes.slice(maxSafes)]
  }, [safes])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setLastChainId(safes[0].chainId)
    }
  }, [safes])

  return (
    <>
      {safesToShow[0].map(({ safeAddress, chainId }) => (
        <SafeListItem
          key={chainId + safeAddress}
          address={safeAddress}
          chainId={chainId}
          href={''}
          shouldScrollToSafe={false}
          isAdded
          isWelcomePage={false}
        />
      ))}

      <Button variant="contained" color="primary" onClick={onShowMore}>
        Show more
      </Button>

      {!!lastChainId &&
        safesToShow[1].map(({ safeAddress, chainId }) => (
          <SafeListItem
            key={chainId + safeAddress}
            address={safeAddress}
            chainId={chainId}
            href={''}
            shouldScrollToSafe={false}
            isAdded
            isWelcomePage={false}
          />
        ))}
    </>
  )
}

export default Login
