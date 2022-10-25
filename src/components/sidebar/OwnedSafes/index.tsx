import { useCurrentChain } from '@/hooks/useChains'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import { List, Typography } from '@mui/material'
import { type ReactElement } from 'react'
import SafeListItem from '../SafeListItem'

const OwnedSafes = (): ReactElement | null => {
  const chain = useCurrentChain()
  const allOwnedSafes = useOwnedSafes()
  const ownedSafesOnChain = chain ? allOwnedSafes[chain.chainId] : undefined

  if (!chain || !ownedSafesOnChain?.length) {
    return null
  }

  return (
    <>
      <Typography variant="body2" display="inline" color="primary.light" textAlign="center" mt={1} mb={2}>
        Safes owned on {chain.chainName}
      </Typography>

      <List sx={{ py: 0 }}>
        {ownedSafesOnChain?.map((address) => (
          <SafeListItem
            key={address}
            address={address}
            chainId={chain.chainId}
            closeDrawer={() => void null}
            shouldScrollToSafe={false}
            noActions
          />
        ))}
      </List>
    </>
  )
}

export default OwnedSafes
