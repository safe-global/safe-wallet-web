import { useState, type ReactElement } from 'react'
import { Divider, Drawer, IconButton, List } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { useRouter } from 'next/router'

import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SafeList from '@/components/sidebar/SafeList'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'
import SidebarFooter from '@/components/sidebar/SidebarFooter'
import useOwnedSafes from '@/hooks/useOwnedSafes'

import css from './styles.module.css'
import SafeListItem from '../SafeListItem'
import useChainId from '@/hooks/useChainId'
import { AppRoutes } from '@/config/routes'

const Sidebar = (): ReactElement => {
  const router = useRouter()
  const chainId = useChainId()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const allOwnedSafes = useOwnedSafes()
  const ownedSafesOnChain = allOwnedSafes[chainId]
  // Routes with a Safe address in query
  const isSafeRoute = router.pathname.startsWith(AppRoutes.safe.index)

  const onDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev)
  }

  return (
    <div className={css.container}>
      <div className={css.scroll}>
        <div className={css.chain}>
          <ChainIndicator />
        </div>

        <IconButton className={css.drawerButton} onClick={onDrawerToggle}>
          <ChevronRight />
        </IconButton>

        {isSafeRoute ? (
          <>
            <SidebarHeader />

            <Divider />

            <SidebarNavigation />
          </>
        ) : (
          <div className={css.noSafeHeader}>
            {ownedSafesOnChain?.length > 0 && (
              <List sx={{ py: 0 }} className={css.ownedSafes}>
                {ownedSafesOnChain?.map((address) => (
                  <SafeListItem
                    key={address}
                    address={address}
                    chainId={chainId}
                    closeDrawer={() => void null}
                    shouldScrollToSafe={false}
                  />
                ))}
              </List>
            )}
          </div>
        )}

        <div style={{ flexGrow: 1 }} />

        <Divider flexItem />

        <SidebarFooter />
      </div>

      <Drawer variant="temporary" anchor="left" open={isDrawerOpen} onClose={onDrawerToggle}>
        <div className={css.drawer}>
          <SafeList closeDrawer={() => setIsDrawerOpen(false)} />
        </div>
      </Drawer>
    </div>
  )
}

export default Sidebar
