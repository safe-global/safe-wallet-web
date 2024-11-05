import AccountItem from './AccountItem'
import { type SafeItem } from './useAllSafes'
import { type MultiChainSafeItem } from './useAllSafesGrouped'
import MultiAccountItem from './MultiAccountItem'
import { isMultiChainSafeItem } from '@/features/multichain/utils/utils'
import { TransitionGroup } from 'react-transition-group'
import { Collapse } from '@mui/material'

type SafeListProps = {
  safes?: (SafeItem | MultiChainSafeItem)[]
  onLinkClick?: () => void
  useTransitions?: boolean
}

const renderSafeItem = (item: SafeItem | MultiChainSafeItem, onLinkClick?: () => void) => {
  return isMultiChainSafeItem(item) ? (
    <MultiAccountItem onLinkClick={onLinkClick} multiSafeAccountItem={item} />
  ) : (
    <AccountItem onLinkClick={onLinkClick} safeItem={item} />
  )
}

const SafesList = ({ safes, onLinkClick, useTransitions = true }: SafeListProps) => {
  if (!safes || safes.length === 0) {
    return null
  }

  return useTransitions ? (
    <TransitionGroup>
      {safes.map((item) => (
        <Collapse key={item.address} timeout="auto">
          {renderSafeItem(item, onLinkClick)}
        </Collapse>
      ))}
    </TransitionGroup>
  ) : (
    <>{safes.map((item) => renderSafeItem(item, onLinkClick))}</>
  )
}

export default SafesList
