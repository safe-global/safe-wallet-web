import React from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import Link from 'next/link'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import WelcomeLogin from './WelcomeLogin'
import GnosisChainLogo from '@/public/images/common/gnosis-chain-logo.png'
import Image from 'next/image'

const BulletListItem = ({ text }: { text: string }) => (
  <li>
    <Typography color="static.main" fontWeight={700}>
      {text}
    </Typography>
  </li>
)

const MarqueeItem = () => {
  return (
    <li className={css.marqueeItem}>
      Free on
      <Image src={GnosisChainLogo} alt="Gnosis Chain logo" width={24} height={24} />
      Gnosis Chain
    </li>
  )
}

const NewSafeSocial = () => {
  return (
    <>
      <Grid container spacing={3} p={3} pb={0} flex={1} direction="row-reverse">
        <Grid item xs={12} lg={6}>
          <WelcomeLogin />
        </Grid>
        <Grid item xs={12} lg={6} flex={1}>
          <div className={css.content}>
            <Box pt={5} alignSelf="center" margin="auto">
              <Typography
                variant="h1"
                fontSize={[44, null, 52]}
                lineHeight={1.15}
                letterSpacing={-1.5}
                color="static.main"
              >
                Get the most secure web3 account in {'<'}30 seconds
              </Typography>

              <ul className={css.numberList}>
                <BulletListItem text="Choose your Google Account" />
                <BulletListItem text="Review, wait and you’re done!" />
                <BulletListItem text="Add more signers later to level up your security" />
              </ul>

              <Link href="https://safe.global/campaigns/social-login-gnosis" passHref>
                <Button startIcon={<ChevronLeftIcon />} className={css.button}>
                  Back to landing page
                </Button>
              </Link>
            </Box>

            <div className={css.marquee}>
              <ul className={css.marqueeContent}>
                <MarqueeItem />
                <MarqueeItem />
                <MarqueeItem />
              </ul>
              <ul className={css.marqueeContent} aria-hidden="true">
                <MarqueeItem />
                <MarqueeItem />
                <MarqueeItem />
              </ul>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default NewSafeSocial
