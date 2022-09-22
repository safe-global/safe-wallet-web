import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { AppCard } from '@/components/safe-apps/AppCard'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'
import { SectionProps } from './types'

const DefaultSection = ({
  title,
  apps,
  prependAddCustomAppCard = false,
  onAddCustomApp,
  onPinApp,
  pinnedIds,
  cardVariant,
}: SectionProps) => {
  const columnSpacing = cardVariant === 'compact' ? 3 : 2

  return (
    <Grid
      container
      rowSpacing={2}
      columnSpacing={columnSpacing}
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
        <Grid item xs={12} sm={6} md={3} xl={1.5}>
          <AddCustomAppCard onSave={onAddCustomApp} safeAppList={apps} />
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
          <Grid key={a.id} item xs={12} sm={6} md={3} xl={1.5}>
            <AppCard safeApp={a} onPin={onPinApp} pinned={pinnedIds?.has(a.id)} variant={cardVariant} />
          </Grid>
        )
      })}
    </Grid>
  )
}
export { DefaultSection }
