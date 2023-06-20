import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature, FEATURES } from '@/utils/chains'

const TxNavigation = () => {
  const chain = useCurrentChain()

  const isEIP1271 = chain && hasFeature(chain, FEATURES.EIP1271)

  const navItems = isEIP1271
    ? transactionNavItems
    : transactionNavItems.filter((item) => item.href !== AppRoutes.transactions.messages)

  return <NavTabs tabs={navItems} />
}

export default TxNavigation
