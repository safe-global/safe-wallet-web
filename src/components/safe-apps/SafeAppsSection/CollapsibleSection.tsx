import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from '@mui/material/Grid'
import { AppCard } from '@/components/safe-apps/AppCard'
import { SectionProps } from './types'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'

const CollapsibleSection = ({
  title,
  apps,
  onPinApp,
  prependAddCustomAppCard,
  onAddCustomApp,
  pinnedIds,
  cardVariant,
}: SectionProps) => {
  const columnSpacing = cardVariant === 'compact' ? 3 : 2

  return (
    <Accordion
      sx={{
        boxShadow: 'none',
        border: 'none',
        background: 'transparent',
      }}
      defaultExpanded
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={({ spacing }) => ({
          padding: `0 ${spacing(3)}`,
          justifyContent: 'flex-start',
          background: 'transparent',
          '& > .MuiAccordionSummary-content': {
            flexGrow: 0,
            '&.Mui-expanded': {
              margin: `${spacing(2)} 0`,
            },
          },
          '&.Mui-expanded': {
            minHeight: 48,
          },
        })}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          sx={({ palette }) => ({ color: palette.secondary.light, textTransform: 'uppercase' })}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={({ spacing }) => ({ padding: `0 ${spacing(3)}` })}>
        <Grid container rowSpacing={2} columnSpacing={columnSpacing}>
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
      </AccordionDetails>
    </Accordion>
  )
}

export { CollapsibleSection }
