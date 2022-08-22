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
}: SectionProps) => {
  return (
    <Grid
      container
      rowSpacing={2}
      columnSpacing={2}
      sx={{
        p: 3,
      }}
    >
      <Grid item xs={12}>
        <Typography variant="caption" fontWeight={700} sx={({ palette }) => ({ color: palette.secondary.light })}>
          {title}
        </Typography>
      </Grid>
      {prependAddCustomAppCard && onAddCustomApp && (
        <Grid item xs={12} sm={6} md={3} xl={1.5}>
          <AddCustomAppCard onSave={onAddCustomApp} safeAppList={apps} />
        </Grid>
      )}

      {apps.map((a) => (
        <Grid key={a.id} item xs={12} sm={6} md={3} xl={1.5}>
          <AppCard safeApp={a} onPin={onPinApp} pinned={pinnedIds?.has(a.id)} />
        </Grid>
      ))}
    </Grid>
  )
}

export { DefaultSection }
