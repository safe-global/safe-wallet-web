import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { AppCard } from '@/components/safe-apps/AppCard'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'
import type { SectionProps } from './types'

const DefaultSection = ({
  title,
  apps,
  allApps,
  prependAddCustomAppCard = false,
  onAddCustomApp,
  onPinApp,
  pinnedIds,
  cardVariant,
}: SectionProps) => {
  return (
    <Grid
      container
      spacing={3}
      sx={{
        p: 3,
      }}
    >
      <Grid item xs={12}>
        <Typography
          variant="caption"
          sx={({ palette }) => ({ color: palette.primary.light, textTransform: 'uppercase' })}
        >
          {title}
        </Typography>
      </Grid>
      {prependAddCustomAppCard && onAddCustomApp && (
        <Grid item xs={12} sm={6} md={4} xl={3}>
          <AddCustomAppCard onSave={onAddCustomApp} safeAppList={allApps} />
        </Grid>
      )}

      {apps.map((a) => {
        if (cardVariant === 'compact') {
          return (
            <Grid key={a.id} item>
              <AppCard safeApp={a} onPin={onPinApp} pinned={pinnedIds?.has(a.id)} variant={cardVariant} />
            </Grid>
          )
        }

        return (
          <Grid key={a.id} item xs={12} sm={6} md={4} xl={3}>
            <AppCard safeApp={a} onPin={onPinApp} pinned={pinnedIds?.has(a.id)} variant={cardVariant} />
          </Grid>
        )
      })}
    </Grid>
  )
}
export { DefaultSection }
