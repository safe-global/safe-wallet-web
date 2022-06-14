import { useState, type ReactElement } from 'react'
import Link from 'next/link'
import { Box, Button, Divider, Drawer, IconButton } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'

import css from './styles.module.css'
import useSafeInfo from '@/services/useSafeInfo'
import ChainIndicator from '../ChainIndicator'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import NewTxButton from '../NewTxButton'
import Navigation from '@/components/common/Navigation'
import useSafeAddress from '@/services/useSafeAddress'

const Sidebar = (): ReactElement => {
  const address = useSafeAddress()
  const { error, loading } = useSafeInfo()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const onDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev)
  }

  const onDrawerToggleDelayed = () => {
    setTimeout(onDrawerToggle, 200)
  }

  return (
    <Box className={css.container} sx={{ backgroundColor: 'background.paper' }}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      <IconButton className={css.drawerButton} onClick={onDrawerToggle}>
        <ChevronRight />
      </IconButton>

      {/* For routes with a Safe address */}
      {address ? (
        <>
          {!error && <SafeHeader />}

          <div className={css.newTxButton}>
            <NewTxButton />
          </div>

          <Divider />

          <div className={css.menu}>
            <Navigation />
          </div>

          {loading && 'Loading Safe info...'}

          {error && 'Failed loading the Safe'}
        </>
      ) : (
        <div className={css.noSafeSidebar} />
      )}

      <Drawer variant="temporary" anchor="left" open={isDrawerOpen} onClose={onDrawerToggle}>
        <div className={css.drawer} onClick={onDrawerToggleDelayed}>
          <Link href="/welcome" passHref>
            <Button variant="contained">+ Add Safe</Button>
          </Link>

          <SafeList />
        </div>
      </Drawer>
    </Box>
  )
}

export default Sidebar
