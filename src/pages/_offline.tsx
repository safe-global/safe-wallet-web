import { Box, Paper, Typography } from '@mui/material'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import type { NextPage } from 'next'
import Head from 'next/head'

const Offline: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Offline</title>
      </Head>

      <main>
        <Box display="flex" justifyContent="center">
          <Paper sx={{ p: 4, mb: 2, maxWidth: 900 }}>
            <Box display="flex" justifyContent="center" mb={2} fontSize={100}>
              <WifiOffIcon fontSize="inherit" />
            </Box>

            <Typography variant="h1">Oops, it looks like you&apos;re offline!</Typography>

            <Typography variant="body1" mt={2}>
              Don&apos;t worry, we&apos;ve got your back. Just take a break and go pet a puppy, stare at a waterfall, or
              do some deep breathing.
            </Typography>

            <Typography variant="body1" mt={2}>
              When you&apos;re ready to reconnect with the digital world, come back and we&apos;ll be here waiting for
              you. Until then, we&apos;ll just be over here refreshing the page every 5 seconds in the hopes that
              you&apos;ll come back. (Kidding, we promise we won&apos;t do that... or will we?)
            </Typography>
          </Paper>
        </Box>
      </main>
    </>
  )
}

export default Offline
