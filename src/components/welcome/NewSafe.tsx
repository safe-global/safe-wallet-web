import React from 'react'
import { Box, Grid, SvgIcon, Typography } from '@mui/material'
import css from './styles.module.css'
import CheckFilled from '@/public/images/common/check-filled.svg'

import WelcomeLogin from './WelcomeLogin'
import SafeListDrawer from '@/components/welcome/SafeListDrawer'

const BulletListItem = ({ text }: { text: string }) => (
  <li>
    <SvgIcon className={css.checkIcon} component={CheckFilled} inheritViewBox />
    <Typography color="static.main" fontWeight={700}>
      {text}
    </Typography>
  </li>
)

const NewSafe = () => {
  return (
    <>
      <Grid container spacing={3} p={3} pb={0} flex={1} direction="row-reverse">
        <Grid item xs={12} lg={6}>
          <WelcomeLogin />
        </Grid>
        <Grid item xs={12} lg={6} flex={1}>
          <div className={css.content}>
            <Box minWidth={{ md: 480 }} className={css.sidebar}>
              <SafeListDrawer />
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
