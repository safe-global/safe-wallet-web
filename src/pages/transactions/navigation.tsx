import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'

export const TransactionNavigation = () => {
  const chain = useCurrentChain()
  debugger
  const isEIP1271 = chain && hasFeature(chain, FEATURES.EIP1271)

  return (
    <NavTabs tabs={isEIP1271 ? transactionNavItems : transactionNavItems.filter((item) => item.label !== 'Messages')} />
  )
}
