import { useState, type ReactElement } from 'react'
import groupBy from 'lodash/groupBy'
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import NftTransferModal from '../tx/modals/NftTransferModal'

const NftCard = ({ nft, onClick }: { nft: SafeCollectibleResponse; onClick: () => void }): ReactElement => (
  <Card className={css.card}>
    <CardContent>
      <img
        className={css.image}
        src={nft.imageUri || '/images/nft-placeholder.png'}
        alt={`${nft.tokenName} #${nft.id}`}
      />

      <Typography fontWeight="bold">{nft.name || `${nft.tokenName} #${nft.id}`}</Typography>

      {nft.description && <Typography>{nft.description.slice(0, 70)}&hellip;</Typography>}

      <Button variant="contained" color="primary" className={css.sendButton} onClick={onClick}>
        Transfer
      </Button>
    </CardContent>
  </Card>
)

export const NftGrid = ({ collectibles }: { collectibles: SafeCollectibleResponse[] }): ReactElement => {
  const [sendNft, setSendNft] = useState<SafeCollectibleResponse | null>(null)
  const collections: Record<string, SafeCollectibleResponse[]> = groupBy(collectibles, 'address')

  return (
    <>
      {Object.entries(collections).map(([address, nfts]) => (
        <Box key={address} pb={4}>
          <Typography variant="h6" mb={1}>
            {nfts[0].tokenName}
          </Typography>

          <Grid container spacing={3}>
            {nfts.map((nft) => (
              <Grid item xs={12} md={4} key={nft.address + nft.id}>
                <NftCard nft={nft} onClick={() => setSendNft(nft)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {sendNft && (
        <NftTransferModal
          onClose={() => setSendNft(null)}
          initialData={[
            {
              recipient: '',
              tokenAddress: sendNft.address,
              tokenId: sendNft.id,
            },
          ]}
        />
      )}
    </>
  )
}
