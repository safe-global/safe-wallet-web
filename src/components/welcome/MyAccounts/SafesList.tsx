import AccountItem from './AccountItem'
import { type SafeItem } from './useAllSafes'
import { type MultiChainSafeItem } from './useAllSafesGrouped'
import MultiAccountItem from './MultiAccountItem'
import { isMultiChainSafeItem } from '@/features/multichain/utils/utils'
import { TransitionGroup } from 'react-transition-group'
import Collapse from '@mui/material/Collapse'

type SafeListProps = {
  safes?: (SafeItem | MultiChainSafeItem)[]
  onLinkClick?: () => void
  loadOverviews: boolean
}

export const SafesList = ({ safes, onLinkClick, loadOverviews }: SafeListProps) => {
  if (!safes || safes.length === 0) {
    return null
  }

  return (
    <TransitionGroup>
      {safes.map((item) =>
        isMultiChainSafeItem(item) ? (
          <Collapse key={item.address} timeout={600}>
            <MultiAccountItem onLinkClick={onLinkClick} multiSafeAccountItem={item} loadOverview={loadOverviews} />
          </Collapse>
        ) : (
          <Collapse key={item.address} timeout={600}>
            <AccountItem
              onLinkClick={onLinkClick}
              safeItem={item}
              key={item.chainId + item.address}
              loadOverview={loadOverviews}
            />
          </Collapse>
        ),
      )}
    </TransitionGroup>
  )
}

export default SafesList
