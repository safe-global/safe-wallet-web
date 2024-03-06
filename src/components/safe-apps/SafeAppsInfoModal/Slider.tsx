import { Box, Button } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import css from './styles.module.css'

type SliderProps = {
  onSlideChange: (slideIndex: number) => void
  initialStep?: number
  children: React.ReactNode
}

const SLIDER_TIMEOUT = 500

const Slider: React.FC<SliderProps> = ({ onSlideChange, children, initialStep }) => {
  const allSlides = useMemo(() => React.Children.toArray(children).filter(Boolean) as React.ReactElement[], [children])

  const [activeStep, setActiveStep] = useState(initialStep || 0)
  const [disabledBtn, setDisabledBtn] = useState(false)

  useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined

    if (disabledBtn) {
      id = setTimeout(() => {
        setDisabledBtn(false)
      }, SLIDER_TIMEOUT)
    }

    return () => {
      if (id) clearTimeout(id)
    }
  }, [disabledBtn])

  const nextSlide = () => {
    if (disabledBtn) return

    const nextStep = activeStep + 1

    onSlideChange(nextStep)
    setActiveStep(nextStep)
    setDisabledBtn(true)
  }

  const prevSlide = () => {
    if (disabledBtn) return

    const prevStep = activeStep - 1

    onSlideChange(prevStep)
    setActiveStep(prevStep)
    setDisabledBtn(true)
  }

  const isFirstStep = activeStep === 0

  return (
    <>
      <div data-sid="78052" className={css.sliderContainer}>
        <div
          className={css.sliderInner}
          style={{
            transform: `translateX(-${activeStep * 100}%)`,
          }}
        >
          {allSlides.map((slide, index) => (
            <div data-sid="63444" className={css.sliderItem} key={index}>
              {slide}
            </div>
          ))}
        </div>
      </div>
      <Box data-sid="25333" display="flex" justifyContent="center" width="100%">
        <Button data-sid="46378" color="primary" variant="outlined" size="small" fullWidth onClick={prevSlide}>
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>

        <Button
          data-sid="80190"
          color="primary"
          variant="contained"
          size="small"
          fullWidth
          onClick={nextSlide}
          style={{
            marginLeft: 10,
          }}
        >
          Continue
        </Button>
      </Box>
    </>
  )
}

export default Slider
