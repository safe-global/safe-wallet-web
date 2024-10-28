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
  loadBalances: boolean
}

export const SafesList = ({ safes, onLinkClick, loadBalances }: SafeListProps) => {
  if (!safes || safes.length === 0) {
    return null
  }

  return (
    <TransitionGroup>
      {safes.map((item) =>
        isMultiChainSafeItem(item) ? (
          <Collapse key={item.address} timeout={600}>
            <MultiAccountItem onLinkClick={onLinkClick} multiSafeAccountItem={item} loadBalances={loadBalances} />
          </Collapse>
        ) : (
          <Collapse key={item.address} timeout={600}>
            <AccountItem
              onLinkClick={onLinkClick}
              safeItem={item}
              key={item.chainId + item.address}
              loadBalances={loadBalances}
            />
          </Collapse>
        ),
      )}
    </TransitionGroup>
  )
}

export default SafesList
