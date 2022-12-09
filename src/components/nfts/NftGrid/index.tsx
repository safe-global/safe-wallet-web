import { useMemo, type ReactElement } from 'react'
import groupBy from 'lodash/groupBy'
import { Box, Divider, Grid, Typography } from '@mui/material'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import NftCard from '../NftCard'
import ImageFallback from '@/components/common/ImageFallback'

const NftGrid = ({
  collectibles,
  onSendClick,
}: {
  collectibles: SafeCollectibleResponse[]
  onSendClick?: (nft: SafeCollectibleResponse) => void
}): ReactElement => {
  const collections: Record<string, SafeCollectibleResponse[]> = useMemo(
    () => groupBy(collectibles, 'address'),
    [collectibles],
  )

  return (
    <>
      {Object.entries(collections).map(([address, nfts]) => {
        const { logoUri, tokenName } = nfts[0]
        return (
          <Box key={address} pb={4}>
            <Grid container alignItems="center" pb={2} spacing={2}>
              <Grid item>
                <ImageFallback
                  src={logoUri}
                  alt={`${tokenName} collection icon`}
                  fallbackSrc="/images/common/nft-placeholder.png"
                  height="45px"
                />
              </Grid>
              <Grid item>
                <Typography variant="h6" mb={1}>
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
