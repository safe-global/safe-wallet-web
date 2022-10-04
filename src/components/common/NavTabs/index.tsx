import Link from 'next/link'
import { Tab, Tabs, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import type { NavItem } from '@/components/sidebar/SidebarNavigation/config'

const NavTabs = ({ tabs }: { tabs: NavItem[] }) => {
  const router = useRouter()
  const activeTab = tabs.map((tab) => tab.href).indexOf(router.pathname)

  return (
    <Tabs value={activeTab}>
      {tabs.map((tab, idx) => {
        return (
          <Link key={tab.href} href={{ pathname: tab.href, query: { safe: router.query.safe } }} passHref>
            <Tab
              label={
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={activeTab === idx ? 'primary' : 'primary.light'}
                  sx={{
                    textTransform: 'none',
                    pb: '9px',
                  }}
                >
                  {tab.label}
                </Typography>
              }
              sx={{ opacity: 1, px: 3, mr: 2, position: 'relative', zIndex: '2' }}
            />
          </Link>
        )
      })}
    </Tabs>
  )
}

export default NavTabs
