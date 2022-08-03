import { type ReactElement } from 'react'
import { Button, Card, CardContent, Typography } from '@mui/material'
import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'

const NftCard = ({ nft, onSendClick }: { nft: SafeCollectibleResponse; onSendClick?: () => void }): ReactElement => (
  <Card className={css.card}>
    <CardContent>
      <div className={css.imageWrapper}>
        <img src={nft.imageUri || '/images/nft-placeholder.png'} alt={`${nft.tokenName} #${nft.id}`} />
      </div>

      <Typography fontWeight="bold" variant="body2">
        {nft.name || `${nft.tokenName} #${nft.id}`}
      </Typography>

      {nft.description && <Typography variant="body2">{nft.description.slice(0, 70)}&hellip;</Typography>}

      {onSendClick ? (
        <Button variant="contained" color="primary" className={css.sendButton} onClick={onSendClick}>
          Transfer
        </Button>
      ) : null}
    </CardContent>
  </Card>
)

export default NftCard
