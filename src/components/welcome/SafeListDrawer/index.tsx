import React from 'react'
import SafeList from '@/components/sidebar/SafeList'
import { DataWidget } from '@/components/welcome/SafeListDrawer/DataWidget'
import { Button, Drawer, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useAppSelector } from '@/store'
import { selectTotalAdded } from '@/store/addedSafesSlice'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import drawerCSS from '@/components/sidebar/Sidebar/styles.module.css'
import css from './styles.module.css'
import ExternalStore from '@/services/ExternalStore'

const { useStore, setStore } = new ExternalStore<boolean>(false)

export const openSafeListDrawer = () => {
  setStore(true)
}

const SafeListDrawer = () => {
  const numberOfAddedSafes = useAppSelector(selectTotalAdded)
  const ownedSafes = useOwnedSafes()
  const numberOfOwnedSafes = Object.values(ownedSafes).reduce((acc, curr) => acc + curr.length, 0)
  const totalNumberOfSafes = numberOfOwnedSafes + numberOfAddedSafes
  const showSidebar = useStore()

  const closeSidebar = () => setStore(false)

  if (totalNumberOfSafes <= 0) {
    return null
  }

  return (
    <>
      <Drawer variant="temporary" anchor="left" open={showSidebar} onClose={closeSidebar}>
        <div className={drawerCSS.drawer}>
          <SafeList closeDrawer={closeSidebar} />

          <div className={drawerCSS.dataWidget}>
            <DataWidget />
          </div>
        </div>
      </Drawer>
      <Button
        className={css.button}
        fullWidth
        variant="contained"
        color="background"
        startIcon={<ChevronRightIcon />}
        onClick={() => setStore(true)}
      >
        <Typography className={css.buttonText} fontWeight="bold">
          My Safe Accounts{' '}
          <Typography color="text.secondary" fontWeight="bold">
            ({totalNumberOfSafes})
          </Typography>
        </Typography>
      </Button>
    </>
  )
}

export default SafeListDrawer
