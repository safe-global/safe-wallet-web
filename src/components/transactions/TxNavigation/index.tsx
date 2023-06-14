import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const TxNavigation = () => {
  const isEIP1271 = useHasFeature(FEATURES.EIP1271)

  return (
    <NavTabs tabs={isEIP1271 ? transactionNavItems : transactionNavItems.filter((item) => item.label !== 'Messages')} />
  )
}

export default TxNavigation
