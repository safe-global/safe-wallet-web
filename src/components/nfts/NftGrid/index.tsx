import { type ReactElement } from 'react'
import groupBy from 'lodash/groupBy'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import NftCard from '../NftCard'
import ImageFallback from '@/components/common/ImageFallback'

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
      {Object.entries(collections).map(([address, nfts]) => {
        const { logoUri, tokenName } = nfts[0]
        return (
          <Box key={address} pb={4}>
            <Grid container alignItems="center" pb={2}>
              <Grid item xs={1}>
                <ImageFallback
                  src={logoUri}
                  alt={`${tokenName} collection icon`}
                  fallbackSrc="/images/nft-placeholder.png"
                  height="45px"
                />
              </Grid>
              <Grid item>
                <Typography variant="h6" mb={1} mr={2}>
                  {tokenName}
                </Typography>
              </Grid>
              <Grid item xs>
                <Divider flexItem />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {nfts.map((nft) => (
                <Grid item xs={12} md={4} lg={3} key={nft.address + nft.id}>
                  <NftCard nft={nft} onSendClick={onSendClick ? () => onSendClick(nft) : undefined} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      })}
    </>
  )
}

export default NftGrid
