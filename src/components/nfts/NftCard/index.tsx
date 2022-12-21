import { type ReactElement } from 'react'
import { Button, Card, CardContent, Typography } from '@mui/material'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import { ellipsis } from '@/utils/formatters'

const NftCard = ({ nft, onSendClick }: { nft: SafeCollectibleResponse; onSendClick?: () => void }): ReactElement => (
  <Card className={css.card}>
    <CardContent>
      <div className={css.imageWrapper}>
        <img src={nft.imageUri || '/images/common/nft-placeholder.png'} alt={`${nft.tokenName} #${nft.id}`} />
      </div>

      <Typography fontWeight="bold" variant="body2">
        {nft.name || `${nft.tokenName} #${nft.id}`}
      </Typography>

      {nft.description && (
        <Typography variant="body2" title={nft.description}>
          {ellipsis(nft.description, 50)}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        className={css.sendButton}
        onClick={onSendClick}
        disabled={!onSendClick}
      >
        Transfer
      </Button>
    </CardContent>
  </Card>
)

export default NftCard
