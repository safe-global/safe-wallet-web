import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { AppRoutes } from '@/config/routes'
import useSafeMessages from '@/hooks/messages/useSafeMessages'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const TxNavigation = () => {
  const isEIP1271 = useHasFeature(FEATURES.EIP1271)
  const { page } = useSafeMessages()

  const hasMessages = page && page.results.length > 0
  const showMessages = isEIP1271 && hasMessages

  const navItems = showMessages
    ? transactionNavItems
    : transactionNavItems.filter((item) => item.href !== AppRoutes.transactions.messages)

  return <NavTabs tabs={navItems} />
}

export default TxNavigation
