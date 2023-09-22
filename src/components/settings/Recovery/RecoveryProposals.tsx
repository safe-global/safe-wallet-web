import { Grid, Typography } from '@mui/material'
import type { Delay } from '@gnosis.pm/zodiac'
import type { ReactElement } from 'react'

import { useDelayModifierQueue } from './useDelayModifierQueue'

// TODO:
export function RecoveryProposals({ delayModifier }: { delayModifier: Delay }): ReactElement | null {
  const [queue] = useDelayModifierQueue(delayModifier)

  if (!queue || queue.length === 0) {
    return null
  }

  return (
    <Grid container spacing={3}>
      <Grid item lg={4} xs={12}>
        <Typography variant="h4" fontWeight={700}>
          Recovery proposals
        </Typography>
      </Grid>

      <Grid item xs>
        <pre>{JSON.stringify(queue, null, 2)}</pre>
      </Grid>
    </Grid>
  )
}
