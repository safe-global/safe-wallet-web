import React, { useState } from 'react'
import { Accordion, AccordionSummary, Box, Drawer, Grid, IconButton, SvgIcon, Typography } from '@mui/material'
import SafeList from '@/components/sidebar/SafeList'
import css from './styles.module.css'
import CheckFilled from '@/public/images/common/check-filled.svg'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { DataWidget } from '@/components/welcome/DataWidget'
import WelcomeLogin from './WelcomeLogin'
import { useAppSelector } from '@/store'
import { selectTotalAdded } from '@/store/addedSafesSlice'

import drawerCSS from '@/components/sidebar/Sidebar/styles.module.css'

const BulletListItem = ({ text }: { text: string }) => (
  <li>
    <SvgIcon className={css.checkIcon} component={CheckFilled} inheritViewBox />
    <Typography color="static.main" fontWeight={700}>
      {text}
    </Typography>
  </li>
)

const NewSafe = () => {
  const addedSafes = useAppSelector(selectTotalAdded)

  const [showSidebar, setShowSidebar] = useState(false)

  const closeSidebar = () => setShowSidebar(false)

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
      <Grid container spacing={3} p={3} pb={0} flex={1} direction="row-reverse">
        <Grid item xs={12} lg={6}>
          <WelcomeLogin />
        </Grid>
        <Grid item xs={12} lg={6} flex={1}>
          <div className={css.content}>
            <Box minWidth={{ md: 480 }} className={css.sidebar}>
              {addedSafes > 0 && (
                <Box display="flex" flexDirection="column">
                  <Box flex={1}>
                    <Accordion className={css.accordion} onClick={() => setShowSidebar(true)} expanded={false}>
                      <AccordionSummary>
                        <Box display="flex" flexDirection="row" alignItems="center" width="100%" gap={2}>
                          <IconButton sx={{ mr: 'auto', padding: '4px' }}>
                            <ChevronRightIcon />
                          </IconButton>
                          <Typography sx={{ mr: 'auto' }} variant="h4" display="inline" fontWeight={700}>
                            My Safe Accounts ({addedSafes})
                          </Typography>
                        </Box>
                      </AccordionSummary>
                    </Accordion>
                  </Box>
                </Box>
              )}
            </Box>

            <Typography variant="h1" fontSize={[44, null, 52]} lineHeight={1} letterSpacing={-1.5} color="static.main">
              Unlock a new way of ownership
            </Typography>

            <Typography mb={1} color="static.main">
              The most trusted decentralized custody protocol and collective asset management platform.
            </Typography>

            <ul className={css.bulletList}>
              <BulletListItem text="Stealth security with multiple owners" />
              <BulletListItem text="Make it yours with modules and guards" />
              <BulletListItem text="Access 130+ ecosystem apps" />
            </ul>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default NewSafe
