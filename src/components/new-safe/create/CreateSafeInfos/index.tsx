import InfoWidget from '@/components/new-safe/create/InfoWidget'
import { Grid } from '@mui/material'
import type { AlertColor } from '@mui/material'
import { type ReactElement } from 'react'

export type CreateSafeInfoItem = {
  title: string
  variant: AlertColor
  steps: { title: string; text: string | ReactElement }[]
}

const CreateSafeInfos = ({
  staticHint,
  dynamicHint,
}: {
  staticHint?: CreateSafeInfoItem
  dynamicHint?: CreateSafeInfoItem
}) => {
  if (!staticHint && !dynamicHint) {
    return null
  }

  return (
    <Grid item xs={12}>
      <Grid container direction="column" gap={3}>
        {staticHint && (
          <Grid item>
            <InfoWidget title={staticHint.title} variant={staticHint.variant} steps={staticHint.steps} />
          </Grid>
        )}
        {dynamicHint && (
          <Grid item>
            <InfoWidget
              title={dynamicHint.title}
              variant={dynamicHint.variant}
              steps={dynamicHint.steps}
              startExpanded
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default CreateSafeInfos
