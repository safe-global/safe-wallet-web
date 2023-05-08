import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeMessages from '@/hooks/useSafeMessages'
import { hasFeature, FEATURES } from '@/utils/chains'

const TxNavigation = () => {
  const chain = useCurrentChain()
  const { page } = useSafeMessages()

  const isEIP1271 = chain && hasFeature(chain, FEATURES.EIP1271)
  const hasMessages = page && page.results.length > 0
  const showMessages = isEIP1271 && hasMessages

  const navItems = showMessages ? transactionNavItems : transactionNavItems.filter((item) => item.label !== 'Messages')

  return <NavTabs tabs={navItems} />
}

export default TxNavigation
