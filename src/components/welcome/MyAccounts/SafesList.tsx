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
}

export const SafesList = ({ safes, onLinkClick }: SafeListProps) => {
  if (!safes || safes.length === 0) {
    return null
  }

  return (
    <TransitionGroup>
      {safes.map((item) =>
        isMultiChainSafeItem(item) ? (
          <Collapse key={item.address} timeout="auto">
            <MultiAccountItem onLinkClick={onLinkClick} multiSafeAccountItem={item} />
          </Collapse>
        ) : (
          <Collapse key={item.address} timeout="auto">
            <AccountItem onLinkClick={onLinkClick} safeItem={item} key={item.chainId + item.address} />
          </Collapse>
        ),
      )}
    </TransitionGroup>
  )
}

export default SafesList
