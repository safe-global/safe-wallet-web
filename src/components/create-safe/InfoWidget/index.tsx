import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, SvgIcon, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import type { AlertColor } from '@mui/material'
import { useEffect, useState, type ReactElement } from 'react'
import LightbulbIcon from '@/public/images/common/lightbulb.svg'

import css from './styles.module.css'

type InfoWidgetProps = {
  title: string
  steps: { title: string; text: string }[]
  variant: AlertColor
  startExpanded?: boolean
}

const InfoWidget = ({ title, steps, variant, startExpanded = false }: InfoWidgetProps): ReactElement | null => {
  const [activeStep, setActiveStep] = useState(0)
  const [expanded, setExpanded] = useState(startExpanded)

  const handleExpandClick = () => setExpanded(true)

  const isFirst = activeStep === 0
  const isLast = activeStep === steps.length - 1
  const isMultiStep = steps.length > 1

  const onPrev = () => setActiveStep((prev) => prev - 1)
  const handleNextClick = (isLast: boolean) => {
    if (isLast) {
      setExpanded(false)
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  useEffect(() => {
    !startExpanded && setExpanded(false)
    setActiveStep(0)
  }, [startExpanded, steps])

  if (steps[activeStep] == undefined) {
    return null
  }

  console.log(steps[activeStep])

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
      <Collapse in={expanded} timeout={0} unmountOnExit>
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
          <Button variant="contained" size="small" onClick={() => handleNextClick(isLast)}>
            {isLast ? 'Got it' : 'Next'}
          </Button>
        </CardActions>
      </Collapse>
    </Card>
  )
}

export default InfoWidget
