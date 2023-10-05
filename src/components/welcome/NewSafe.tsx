import React, { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, SvgIcon, Typography } from '@mui/material'
import SafeList from '@/components/sidebar/SafeList'
import css from './styles.module.css'
import CheckFilled from '@/public/images/common/check-filled.svg'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { DataWidget } from '@/components/welcome/DataWidget'
import WelcomeLogin from './WelcomeLogin'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'

const NewSafe = () => {
  const [expanded, setExpanded] = useState(false)

  const addedSafes = useAppSelector(selectAllAddedSafes)

  const numberOfSafes = Object.values(addedSafes).reduce<number>((prev, curr) => Object.keys(curr).length + prev, 0)

  const toggleSafeList = () => {
    return setExpanded((prev) => !prev)
  }

  return (
    <Grid container spacing={3} p={3} pb={0} flex={1} direction="row-reverse">
      <Grid item xs={12} lg={6}>
        <WelcomeLogin />
      </Grid>
      <Grid item xs={12} lg={6} flex={1}>
        <div className={css.content}>
          {numberOfSafes > 0 && (
            <Box minWidth={{ md: 480 }} className={css.sidebar}>
              <Box display="flex" flexDirection="column" height="100%">
                <Box flex={1}>
                  <Accordion className={css.accordion} onClick={toggleSafeList} expanded={expanded}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h4" display="inline" fontWeight={700}>
                        My Safe Accounts ({numberOfSafes})
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ padding: 0 }} onClick={(event) => event.stopPropagation()}>
                      <SafeList />
                      <Box mt={2} display={{ xs: 'none', md: 'block' }}>
                        <DataWidget />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>
            </Box>
          )}
          <Typography variant="h1" fontSize={[44, null, 52]} lineHeight={1} letterSpacing={-1.5} color="static.main">
            Unlock a new way of ownership
          </Typography>

          <Typography mb={1} color="static.main">
            The most trusted decentralized custody protocol and collective asset management platform.
          </Typography>

          <Grid container spacing={2} mb="auto">
            <Grid item xs={12} display="flex" flexDirection="row" gap={1} alignItems="center">
              <SvgIcon component={CheckFilled} inheritViewBox />
              <Typography color="static.main" fontWeight={700}>
                Stealth security with multiple owners
              </Typography>
            </Grid>
            <Grid item xs={12} display="flex" flexDirection="row" gap={1} alignItems="center">
              <SvgIcon component={CheckFilled} inheritViewBox />
              <Typography color="static.main" fontWeight={700}>
                Make it yours with modules and guards
              </Typography>
            </Grid>
            <Grid item xs={12} display="flex" flexDirection="row" gap={1} alignItems="center">
              <SvgIcon component={CheckFilled} inheritViewBox />
              <Typography color="static.main" fontWeight={700}>
                Access 130+ ecosystem apps
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  )
}

export default NewSafe
