import useChainId from '@/hooks/useChainId'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import { List } from '@mui/material'
import { type ReactElement } from 'react'
import SafeListItem from '../SafeListItem'

const OwnedSafes = (): ReactElement | null => {
  const chainId = useChainId()
  const allOwnedSafes = useOwnedSafes()
  const ownedSafesOnChain = allOwnedSafes[chainId]

  return ownedSafesOnChain?.length > 0 ? (
    <List sx={{ py: 0 }}>
      {ownedSafesOnChain?.map((address) => (
        <SafeListItem
          key={address}
          address={address}
          chainId={chainId}
          closeDrawer={() => void null}
          shouldScrollToSafe={false}
        />
      ))}
    </List>
  ) : null
}

export default OwnedSafes
