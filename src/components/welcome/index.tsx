import React from 'react'
import { Button, Grid, Paper, SvgIcon, Typography, ButtonBase, Box } from '@mui/material'
import { useRouter } from 'next/router'
import { CREATE_SAFE_EVENTS, LOAD_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import Track from '../common/Track'
import { AppRoutes } from '@/config/routes'
import SafeList from '@/components/sidebar/SafeList'
import css from './styles.module.css'
import NewSafeIcon from '@/public/images/welcome/new-safe.svg'
import LoadSafeIcon from '@/public/images/welcome/load-safe.svg'
import Footer from '@/components/common/Footer'
import useWallet from '@/hooks/wallets/useWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'

const NewSafe = () => {
  const router = useRouter()
  const wallet = useWallet()
  const connectWallet = useConnectWallet()

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4} lg={3.5}>
        <div className={css.sidebar}>
          <SafeList closeDrawer={() => {}} />
        </div>
      </Grid>
      <Grid item xs={12} md={8} lg={8.5}>
        <div className={css.main}>
          <div className={css.content}>
            <Typography variant="h1" fontSize={52} lineHeight={1} letterSpacing={-1.5} mb={1}>
              Welcome to the Safe
            </Typography>
            <Typography mb={5}>
              Safe is the most trusted platform to manage digital assets.
              <br />
              Here is how to get started:
            </Typography>
            {wallet ? (
              <Grid container spacing={3} sx={{ maxWidth: '800px' }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ padding: 4, height: 1 }}>
                    <SvgIcon component={NewSafeIcon} inheritViewBox sx={{ width: '42px', height: '42px' }} />
                    <Typography variant="h3" fontWeight={700} mb={1} mt={3}>
                      Create Safe
                    </Typography>
                    <Typography variant="body2" mb={3}>
                      New Safe that is controlled by one or multiple owners.{' '}
                    </Typography>
                    <Track {...CREATE_SAFE_EVENTS.CREATE_BUTTON}>
                      <Button variant="contained" onClick={() => router.push(AppRoutes.open)}>
                        + Create new Safe
                      </Button>
                    </Track>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ padding: 4, height: 1 }}>
                    <SvgIcon component={LoadSafeIcon} inheritViewBox sx={{ width: '42px', height: '42px' }} />
                    <Typography variant="h3" fontWeight={700} mb={1} mt={3}>
                      Load Existing Safe
                    </Typography>
                    <Typography variant="body2" mb={3}>
                      Already have a Safe? Load your Safe using your Safe address.
                    </Typography>
                    <Track {...LOAD_SAFE_EVENTS.LOAD_BUTTON}>
                      <Button variant="outlined" onClick={() => router.push('/load')}>
                        Add existing Safe
                      </Button>
                    </Track>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <ButtonBase onClick={connectWallet} disableRipple>
                <Paper sx={{ padding: 4, height: 1 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <KeyholeIcon />
                    <Typography variant="h4" fontWeight={700}>
                      Connect wallet to start using Safe.
                    </Typography>
                  </Box>
                </Paper>
              </ButtonBase>
            )}
          </div>
          <div className={css.footer}>
            <Footer />
          </div>
        </div>
      </Grid>
    </Grid>
  )
}

export default NewSafe
