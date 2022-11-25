import { memo, useMemo, useState } from 'react'
import { alpha, Box } from '@mui/system'
import { Grid, LinearProgress } from '@mui/material'

import type { BrowserPermission } from '@/hooks/safe-apps/permissions'
import Slider from './Slider'
import LegalDisclaimer from './LegalDisclaimer'
import AllowedFeaturesList from './AllowedFeaturesList'
import type { AllowedFeatures, AllowedFeatureSelection } from '../types'
import { PermissionStatus } from '../types'
import UnknownAppWarning from './UnknownAppWarning'

type SafeAppsInfoModalProps = {
  onCancel: () => void
  onConfirm: (shouldHide: boolean, browserPermissions: BrowserPermission[]) => void
  features: AllowedFeatures[]
  appUrl: string
  isConsentAccepted?: boolean
  isPermissionsReviewCompleted: boolean
  isSafeAppInDefaultList: boolean
  isFirstTimeAccessingApp: boolean
}

const SafeAppsInfoModal = ({
  onCancel,
  onConfirm,
  features,
  appUrl,
  isConsentAccepted,
  isPermissionsReviewCompleted,
  isSafeAppInDefaultList,
  isFirstTimeAccessingApp,
}: SafeAppsInfoModalProps): JSX.Element => {
  const [hideWarning, setHideWarning] = useState(false)
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

    if (!isSafeAppInDefaultList && isFirstTimeAccessingApp) {
      totalSlides += 1
    }

    return totalSlides
  }, [isConsentAccepted, isFirstTimeAccessingApp, isPermissionsReviewCompleted, isSafeAppInDefaultList])

  const handleSlideChange = (newStep: number) => {
    const isFirstStep = newStep === -1
    const isLastStep = newStep === totalSlides

    if (isFirstStep) {
      onCancel()
    }

    if (isLastStep) {
      onConfirm(
        true,
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

  const shouldShowUnknownAppWarning = useMemo(
    () => !isSafeAppInDefaultList && isFirstTimeAccessingApp,
    [isFirstTimeAccessingApp, isSafeAppInDefaultList],
  )

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
        sx={({ palette, shape }) => ({
          width: '450px',
          backgroundColor: palette.background.paper,
          borderRadius: shape.borderRadius,
          boxShadow: `1px 2px 10px 0 ${alpha(palette.text.primary, 0.18)}`,
        })}
      >
        <LinearProgress
          variant="determinate"
          value={progressValue}
          color={progressValue === 100 && shouldShowUnknownAppWarning ? 'warning' : 'primary'}
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
              <AllowedFeaturesList
                features={selectedFeatures}
                onFeatureSelectionChange={handleFeatureSelectionChange}
              />
            )}
            {shouldShowUnknownAppWarning && <UnknownAppWarning url={appUrl} onHideWarning={setHideWarning} />}
          </Slider>
        </Grid>
      </Box>
    </Box>
  )
}

export default memo(SafeAppsInfoModal)
