import { Box, Button, Card, CardActions, CardContent, CardHeader, SvgIcon, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useState } from 'react'
import type { AlertColor } from '@mui/material'
import type { ReactElement } from 'react'

import LightbulbIcon from '@/public/images/common/lightbulb.svg'

import css from './styles.module.css'

type Props = {
  title: string
  steps: { title: string; text: string }[]
  variant: AlertColor
}

const InfoWidget = ({ title, steps, variant }: Props): ReactElement | null => {
  const [activeStep, setActiveStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const isFirst = activeStep === 0
  const isLast = activeStep === steps.length - 1

  const isMultiStep = steps.length > 1

  const onPrev = () => {
    if (!isFirst) {
      setActiveStep((prev) => prev - 1)
    }
  }

  const onNext = () => {
    if (isLast) {
      setDismissed(true)
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  if (dismissed) {
    return null
  }

  return (
    <Card sx={{ backgroundColor: ({ palette }) => palette[variant]?.background }}>
      <CardHeader
        className={css.header}
        title={
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
            {isMultiStep && (
              <Typography variant="caption" className={css.count}>
                {activeStep + 1} of {steps.length}
              </Typography>
            )}
          </Box>
        }
      />
      <CardContent>
        <Typography variant="h5">{steps[activeStep].title}</Typography>
        <Typography variant="body2">{steps[activeStep].text}</Typography>
      </CardContent>
      <CardActions className={css.actions}>
        {isMultiStep && !isFirst && (
          <Button variant="contained" size="small" onClick={onPrev} startIcon={<ChevronLeftIcon />}>
            Previous
          </Button>
        )}
        <Button variant="outlined" size="small" onClick={onNext}>
          Got it
        </Button>
      </CardActions>
    </Card>
  )
}

export default InfoWidget
