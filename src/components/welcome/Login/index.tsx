import React, { useMemo } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import useAllOwnedSafes from '@/hooks/useOwnedSafes'
import { Button } from '@mui/material'

const maxSafes = 5

const Login = () => {
  const [safes] = useAllOwnedSafes(maxSafes)

  const safesToShow = useMemo(() => {
    return safes.slice(0, maxSafes)
  }, [safes])

  return (
    <>
      {safesToShow.map(({ safeAddress, chainId }) => (
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

      <Button variant="contained" color="primary" href="/safes/new" sx={{ mt: 2 }}>
        Show more
      </Button>
    </>
  )
}

export default Login
