import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature, FEATURES } from '@/utils/chains'

const TxNavigation = () => {
  const chain = useCurrentChain()
  const isEIP1271 = chain && hasFeature(chain, FEATURES.EIP1271)

  return (
    <NavTabs tabs={isEIP1271 ? transactionNavItems : transactionNavItems.filter((item) => item.label !== 'Messages')} />
  )
}

export default TxNavigation
