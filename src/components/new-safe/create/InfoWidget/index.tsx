import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  SvgIcon,
  Typography,
} from '@mui/material'
import type { AlertColor } from '@mui/material'
import type { ReactElement } from 'react'
import LightbulbIcon from '@/public/images/common/lightbulb.svg'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from 'src/components/new-safe/create/InfoWidget/styles.module.css'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'

type InfoWidgetProps = {
  title: string
  steps: { title: string; text: string | ReactElement }[]
  variant: AlertColor
  startExpanded?: boolean
}

const InfoWidget = ({ title, steps, variant, startExpanded = false }: InfoWidgetProps): ReactElement | null => {
  if (steps.length === 0) {
    return null
  }

  return (
    <Card
      sx={{
        backgroundColor: ({ palette }) => palette[variant]?.background,
        borderColor: ({ palette }) => palette[variant]?.main,
        borderWidth: 1,
      }}
    >
      <CardHeader
        className={css.cardHeader}
        title={
          <Box className={css.title} sx={{ backgroundColor: ({ palette }) => palette[variant]?.main }}>
            <SvgIcon component={LightbulbIcon} inheritViewBox className={css.titleIcon} />
            <Typography variant="caption">
              <b>{title}</b>
            </Typography>
          </Box>
        }
      />
      <Box className={css.tipsList}>
        <CardContent>
          {steps.map(({ title, text }) => {
            return (
              <Accordion
                key={title}
                className={css.tipAccordion}
                defaultExpanded={startExpanded}
                onChange={(e, expanded) => expanded && trackEvent({ ...CREATE_SAFE_EVENTS.OPEN_HINT, label: title })}
              >
                <AccordionSummary
                  expandIcon={
                    <IconButton sx={{ '&:hover': { background: ({ palette }) => palette[variant]?.light } }}>
                      <ExpandMoreIcon sx={{ color: ({ palette }) => palette[variant]?.main }} />
                    </IconButton>
                  }
                >
                  {title}
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">{text}</Typography>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </CardContent>
      </Box>
    </Card>
  )
}

export default InfoWidget
