import { AppRoutes } from '@/config/routes'
import useSafeInfo from '@/hooks/useSafeInfo'
import ellipsisAddress from '@/utils/ellipsisAddress'
import { Box, Button, Divider, Typography, SvgIcon } from '@mui/material'
import { grey } from '@mui/material/colors'
import Link from 'next/link'
import React from 'react'
import Members from '../common/Members'
import TransactionHistory from '../common/TransactionHistory'
import TransactionQueue from '../common/TransactionQueue'

import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NftIcon from '@/public/images/common/nft.svg'

import css from '@/components/chat/styles.module.css'

export const ChatOverview: React.FC<{
  owners: any[]
}> = ({ owners }) => {
  const { safe, safeAddress } = useSafeInfo()
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '40px', pt: 2, px: 3 }}>
        <Typography sx={{ color: grey[600] }}>Network</Typography>
        <Typography>
          {safe?.chainId === '137'
            ? 'Matic'
            : safe?.chainId === '1'
            ? 'Ethereum'
            : safe?.chainId === '10'
            ? 'Optimism'
            : safe?.chainId === '80001'
            ? 'Mumbai'
            : ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '40px', pt: 2, px: 3 }}>
        <Typography sx={{ color: grey[600] }} paragraph>
          Address
        </Typography>
        <Typography paragraph noWrap>
          {ellipsisAddress(`${safeAddress}`)}
        </Typography>
      </Box>
      <Divider />
      <Members members={owners} />
      <Divider />
      <TransactionQueue />
      <Divider />
      <TransactionHistory />
      <Divider />
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontWeight: 600 }} paragraph>
          Assets
        </Typography>
        <Typography paragraph>View all tokens and NFTs the Safe holds.</Typography>
        <Link href={{ pathname: AppRoutes.balances.index, query: { safe: `${safeAddress}` } }} key={`${safe}`} passHref>
          <Button variant="outlined" className={css.buttonstyled} size="small">
            View Assets
          </Button>
        </Link>
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontWeight: 600 }} paragraph>
          Apps
        </Typography>
        <Typography paragraph>
          Explore the Safe Apps ecosystem &mdash; connect to your favourite web3 applications with your Safe wallet,
          securely and efficiently
        </Typography>
        <Link href={{ pathname: AppRoutes.apps.index, query: { safe: `${safeAddress}` } }} key={`${safe}`} passHref>
          <Button variant="outlined" className={css.buttonstyled} size="small">
            Explore Apps
          </Button>
        </Link>
      </Box>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          pl: 3,
          pr: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid var(--color-border-light)'
        }}
      >
        <Link href={{ pathname: AppRoutes.balances.index, query: { safe: `${safeAddress}` } }} key={`${safe}`} passHref>
          <Button variant="outlined" className={css.buttonstyled} startIcon={<SvgIcon component={AssetsIcon} inheritViewBox />} fullWidth>
            Send tokens
          </Button>
        </Link>
        <Link href={{ pathname: AppRoutes.balances.nfts, query: { safe: `${safeAddress}` } }} key={`${safe}`} passHref>
          <Button variant="outlined" className={css.buttonstyled} startIcon={<SvgIcon component={NftIcon} inheritViewBox />} fullWidth>
            Send NFTs
          </Button>
        </Link>
      </Box>
    </>
  )
}
