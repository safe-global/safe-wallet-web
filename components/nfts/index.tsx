import { Card, CardContent, Grid, Typography } from '@mui/material'
import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'

import css from './styles.module.css'

export const NftGrid = ({ collectibles }: { collectibles: SafeCollectibleResponse[] }) => {
  return (
    <Grid container spacing={3}>
      {collectibles.map((collectible) => {
        return (
          <Grid item xs={12} md={4} key={collectible.id}>
            <Card>
              <CardContent>
                <img className={css.image} src={collectible.imageUri} alt={collectible.description} />
                <Typography fontWeight="bold">{collectible.name}</Typography>
                <Typography>{collectible.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
