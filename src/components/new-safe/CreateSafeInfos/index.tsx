import InfoWidget from '@/components/create-safe/InfoWidget'
import { Grid } from '@mui/material'
import type { AlertColor } from '@mui/material'

export type CreateSafeInfoItem = {
  title: string
  variant: AlertColor
  steps: { title: string; text: string }[]
}

const CreateSafeInfos = ({
  staticHint,
  dynamicHint,
}: {
  staticHint?: CreateSafeInfoItem
  dynamicHint?: CreateSafeInfoItem
}) => {
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
