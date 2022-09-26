import { type ReactElement } from 'react'
import groupBy from 'lodash/groupBy'
import { Box, Grid, Typography } from '@mui/material'
import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import NftCard from '../NftCard'

const NftGrid = ({
  collectibles,
  onSendClick,
}: {
  collectibles: SafeCollectibleResponse[]
  onSendClick?: (nft: SafeCollectibleResponse) => void
}): ReactElement => {
  const collections: Record<string, SafeCollectibleResponse[]> = groupBy(collectibles, 'address')

  return (
    <>
      {Object.entries(collections).map(([address, nfts]) => (
        <Box key={address}>
          <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
            {nfts[0].tokenName}
          </Typography>

          <Grid container spacing={3}>
            {nfts.map((nft) => (
              <Grid item xs={12} md={4} lg={3} key={nft.address + nft.id}>
                <NftCard nft={nft} onSendClick={onSendClick ? () => onSendClick(nft) : undefined} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </>
  )
}

export default NftGrid
