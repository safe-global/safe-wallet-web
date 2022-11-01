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
import css from './styles.module.css'

type InfoWidgetProps = {
  title: string
  steps: { title: string; text: string }[]
  variant: AlertColor
  startExpanded?: boolean
}

const InfoWidget = ({ title, steps, variant, startExpanded = false }: InfoWidgetProps): ReactElement | null => {
  const isMultiStep = steps.length > 1

  if (steps.length === 0) {
    return null
  }

  return (
    <Card sx={{ backgroundColor: ({ palette }) => palette[variant]?.background }}>
      <CardHeader
        sx={{ paddingBottom: '0px' }}
        title={
          <>
            <Box className={css.headerWrapper}>
              <Typography
                variant="caption"
                className={css.title}
                sx={{
                  backgroundColor: ({ palette }) => palette[variant]?.main,
                }}
              >
                <SvgIcon component={LightbulbIcon} inheritViewBox fontSize="inherit" className={css.lightbulb} />
                {title}
              </Typography>
              <Typography variant="caption" className={css.count}>
                {steps.length} tip{isMultiStep && 's'}
              </Typography>
            </Box>
          </>
        }
      />
      <CardContent sx={{ padding: '0', '&.MuiCardContent-root': { paddingBottom: '0px' } }}>
        {steps.map(({ title, text }) => {
          return (
            <Accordion
              key={title.replace(' ', '-')}
              className={css.tipAccordion}
              sx={{
                '&:hover > .MuiAccordionSummary-root': {
                  background: 'inherit',
                },
                '&.Mui-expanded > .MuiAccordionSummary-root': {
                  background: 'inherit',
                },
              }}
              defaultExpanded={startExpanded}
            >
              <AccordionSummary
                expandIcon={
                  <IconButton sx={{ '&:hover': { background: ({ palette }) => palette[variant]?.light } }}>
                    <ExpandMoreIcon sx={{ color: ({ palette }) => palette[variant]?.main }} />
                  </IconButton>
                }
              >
                <Typography>{title}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ paddingTop: '0px' }}>
                <Typography variant="body2">{text}</Typography>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default InfoWidget
