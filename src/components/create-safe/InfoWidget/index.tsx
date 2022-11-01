import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, SvgIcon, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useEffect, useState } from 'react'
import type { AlertColor } from '@mui/material'
import type { ReactElement } from 'react'

import LightbulbIcon from '@/public/images/common/lightbulb.svg'

import css from './styles.module.css'

type Props = {
  title: string
  steps: { title: string; text: string }[]
  variant: AlertColor
  startCollapsed?: boolean
}

const InfoWidget = ({ title, steps, variant, startCollapsed = true }: Props): ReactElement | null => {
  console.log('steps', steps)
  const [activeStep, setActiveStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(!startCollapsed)

  const handleExpandClick = () => {
    // setExpanded(true)
    setExpanded(!expanded)
  }

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

  // Reset if steps change
  useEffect(() => {
    setActiveStep(0)
    setDismissed(false)
  }, [steps])

  if (dismissed || steps.length === 0) {
    return null
  }

  return (
    <Card sx={{ backgroundColor: ({ palette }) => palette[variant]?.background }}>
      <CardHeader
        onClick={handleExpandClick}
        className={css.header}
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
              {isMultiStep && (
                <Typography variant="caption" className={css.count}>
                  {activeStep + 1} of {steps.length}
                </Typography>
              )}
            </Box>
            {!expanded && (
              <Box className={css.tipsTitles}>
                {steps.map(({ title }) => (
                  <Box className={css.listItem} key={title.replace(' ', '-')}>
                    <Box
                      className={css.dot}
                      sx={{
                        backgroundColor: ({ palette }) => palette[variant]?.main,
                      }}
                    />
                    <Typography variant="body2">{title}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
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
      </Collapse>
    </Card>
  )
}

export default InfoWidget
