import Link from 'next/link'
import { Tab, Tabs, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import type { NavItem } from '@/components/sidebar/SidebarNavigation/config'

import css from './styles.module.css'

const NavTabs = ({ tabs }: { tabs: NavItem[] }) => {
  const router = useRouter()
  const activeTab = tabs.map((tab) => tab.href).indexOf(router.pathname)

  return (
    <Tabs value={activeTab} variant="scrollable" allowScrollButtonsMobile className={css.tabs}>
      {tabs.map((tab, idx) => {
        return (
          <Link key={tab.href} href={{ pathname: tab.href, query: { safe: router.query.safe } }} passHref>
            <Tab
              className={css.tab}
              label={
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={activeTab === idx ? 'primary' : 'primary.light'}
                  className={css.label}
                >
                  {tab.label}
                </Typography>
              }
            />
          </Link>
        )
      })}
    </Tabs>
  )
}

export default NavTabs
