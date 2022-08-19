import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from '@mui/material/Grid'
import { AppCard } from '@/components/safe-apps/AppCard'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { SafeAppCardVariants } from '../AppCard'

type Props = {
  title: string
  apps: SafeAppData[]
  cardVariant?: SafeAppCardVariants
}

const CollapsibleSection = ({ title, apps }: Props) => {
  return (
    <Accordion
      sx={{
        boxShadow: 'none',
        border: 'none',
        background: 'transparent',
        '.MuiCollapse-wrapperInner': {
          // the padding is needed to prevent the box-shadow on the app card from being cut off
          pb: 1,
        },
      }}
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
        <Typography variant="caption" fontWeight={700} sx={({ palette }) => ({ color: palette.secondary.light })}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={({ spacing }) => ({ padding: `0 ${spacing(3)}` })}>
        <Grid container rowSpacing={2} columnSpacing={2}>
          {apps.map((a) => (
            <Grid key={a.id || a.url} item xs={12} sm={6} md={3} xl={1.5}>
              <AppCard safeApp={a} />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export { CollapsibleSection }
