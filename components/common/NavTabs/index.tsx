import Link from 'next/link'
import { Tab, Tabs, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { NavItem } from '@/components/sidebar/SidebarNavigation/config'

const NavTabs = ({ tabs }: { tabs: NavItem[] }) => {
  const router = useRouter()
  const activeTab = tabs.map((tab) => tab.href).indexOf(router.pathname)

  return (
    <Tabs
      value={activeTab}
      sx={({ palette }) => ({
        marginBottom: 4,
        '& .MuiTabs-flexContainer': { borderBottom: `2px solid ${palette.border.light}` },
      })}
    >
      {tabs.map((tab, idx) => {
        return (
          <Link key={tab.href} href={{ pathname: tab.href, query: router.query }} passHref>
            <Tab
              label={
                <Typography
                  variant="overline"
                  fontWeight={activeTab === idx ? 'bold' : 'inherit'}
                  color={activeTab === idx ? 'primary' : 'inherit'}
                >
                  {tab.label}
                </Typography>
              }
              sx={{ opacity: 1, paddingX: 6 }}
            />
          </Link>
        )
      })}
    </Tabs>
  )
}

export default NavTabs
