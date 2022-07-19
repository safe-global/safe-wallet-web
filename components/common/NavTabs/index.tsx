import Link from 'next/link'
import { SyntheticEvent, useState } from 'react'
import { Tab, Tabs, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { NavItem } from '@/components/sidebar/SidebarNavigation/config'

const NavTabs = ({ tabs }: { tabs: NavItem[] }) => {
  const router = useRouter()
  const initialActive = tabs.map((tab) => tab.href).indexOf(router.pathname)
  const [activeTab, setActiveTab] = useState<number>(initialActive)

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
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
