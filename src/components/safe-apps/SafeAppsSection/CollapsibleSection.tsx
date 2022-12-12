import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from '@mui/material/Grid'
import { AppCard } from '@/components/safe-apps/AppCard'
import type { SectionProps } from './types'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'
import styles from './styles.module.css'

const CollapsibleSection = ({
  title,
  apps,
  allApps,
  onPinApp,
  prependAddCustomAppCard,
  onAddCustomApp,
  pinnedIds,
  cardVariant,
  onDeleteApp,
}: SectionProps) => {
  const columnSpacing = cardVariant === 'compact' ? 3 : 2

  return (
    <Accordion className={styles.accordion} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: ({ palette }) => palette.primary.light }} />}>
        <Typography
          variant="caption"
          sx={({ palette }) => ({ color: palette.primary.light, textTransform: 'uppercase', fontWeight: 700 })}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={({ spacing }) => ({ padding: `0 ${spacing(3)}` })}>
        <Grid container rowSpacing={2} columnSpacing={columnSpacing}>
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
                <AppCard
                  safeApp={a}
                  onPin={onPinApp}
                  pinned={pinnedIds?.has(a.id)}
                  variant={cardVariant}
                  onDelete={onDeleteApp}
                />
              </Grid>
            )
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export { CollapsibleSection }
