import { memo, useMemo, useState } from 'react'
import Slider from './Slider'
import LegalDisclaimer from './LegalDisclaimer'
import SecurityFeedbackAllowedFeatures from './SecurityFeedbackAllowedFeatures'
import { alpha, Box } from '@mui/system'
import { Grid, LinearProgress } from '@mui/material'
import { AllowedFeatures, AllowedFeatureSelection, PermissionStatus } from '../types'
import { BrowserPermission } from '@/hooks/safe-apps/permissions'

interface SecurityFeedbackModalProps {
  onCancel: () => void
  onConfirm: (browserPermisisons: BrowserPermission[]) => void
  features: AllowedFeatures[]
  isConsentAccepted?: boolean
  isPermissionsReviewCompleted: boolean
}

const SecurityFeedbackModal = ({
  onCancel,
  onConfirm,
  features,
  isConsentAccepted,
  isPermissionsReviewCompleted,
}: SecurityFeedbackModalProps): JSX.Element => {
  const [selectedFeatures, setSelectedFeatures] = useState<AllowedFeatureSelection[]>(
    features.map((feature) => {
      return {
        feature,
        checked: true,
      }
    }),
  )
  const [currentSlide, setCurrentSlide] = useState(0)

  const totalSlides = useMemo(() => {
    let totalSlides = 0

    if (!isConsentAccepted) {
      totalSlides += 1
    }

    if (!isPermissionsReviewCompleted) {
      totalSlides += 1
    }

    return totalSlides
  }, [isConsentAccepted, isPermissionsReviewCompleted])

  const handleSlideChange = (newStep: number) => {
    const isFirstStep = newStep === -1
    const isLastStep = newStep === totalSlides

    if (isFirstStep) {
      onCancel()
    }

    if (isLastStep) {
      onConfirm(
        selectedFeatures.map(({ feature, checked }) => {
          return {
            feature,
            status: checked ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
          }
        }),
      )
    }

    setCurrentSlide(newStep)
  }

  const progressValue = useMemo(() => {
    return ((currentSlide + 1) * 100) / totalSlides
  }, [currentSlide, totalSlides])

  const isLastSlide = useMemo(() => {
    return currentSlide === totalSlides - 1
  }, [currentSlide, totalSlides])

  const handleFeatureSelectionChange = (feature: AllowedFeatures, checked: boolean) => {
    setSelectedFeatures(
      selectedFeatures.map((feat) => {
        if (feat.feature === feature) {
          return {
            feature,
            checked,
          }
        }
        return feat
      }),
    )
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" height="calc(100vh - 52px)">
      <Box
        sx={({ palette }) => ({
          width: '450px',
          backgroundColor: palette.background.paper,
          borderRadius: '8px',
          boxShadow: `1px 2px 10px 0 ${alpha(palette.text.primary, 0.18)}`,
        })}
      >
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={({ palette }) => ({
            height: '6px',
            backgroundColor: palette.background.paper,
            borderRadius: '8px 8px 0 0',
            '> .MuiLinearProgress-bar': {
              backgroundColor: palette.primary.main,
              borderRadius: '8px',
            },
          })}
        />
        <Grid container justifyContent="center" alignItems="center" direction="column" textAlign="center" p={3}>
          <Slider onSlideChange={handleSlideChange}>
            {!isConsentAccepted && <LegalDisclaimer />}
            {!isPermissionsReviewCompleted && (
              <SecurityFeedbackAllowedFeatures
                features={selectedFeatures}
                onFeatureSelectionChange={handleFeatureSelectionChange}
              />
            )}
          </Slider>
        </Grid>
      </Box>
    </Box>
  )
}

export default memo(SecurityFeedbackModal)
