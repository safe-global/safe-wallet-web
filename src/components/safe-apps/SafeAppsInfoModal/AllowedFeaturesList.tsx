import { Box, Typography, SvgIcon } from '@mui/material'
import ShieldIcon from '@/public/images/settings/permissions/shield.svg'

import { getBrowserPermissionDisplayValues } from '@/hooks/safe-apps/permissions'
import PermissionsCheckbox from '../PermissionCheckbox'

import { AllowedFeatures, AllowedFeatureSelection, isBrowserFeature } from '../types'

type SafeAppsInfoAllowedFeaturesProps = {
  features: AllowedFeatureSelection[]
  onFeatureSelectionChange: (feature: AllowedFeatures, checked: boolean) => void
}

const AllowedFeaturesList: React.FC<SafeAppsInfoAllowedFeaturesProps> = ({
  features,
  onFeatureSelectionChange,
}): React.ReactElement => {
  return (
    <>
      <SvgIcon component={ShieldIcon} inheritViewBox color="secondary" />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          textAlign: 'center',
          margin: '0 75px',
        }}
      >
        Manage the features Safe App can use
      </Typography>
      <Box mx={1} my={3} textAlign="left">
        <Typography>This app is requesting permission to use:</Typography>
        <br />
        <Box display="flex" flexDirection="column" ml={2}>
          {features
            .filter(({ feature }) => isBrowserFeature(feature))
            .map(({ feature, checked }, index) => (
              <PermissionsCheckbox
                key={index}
                name="checkbox"
                checked={checked}
                onChange={(_, checked) => onFeatureSelectionChange(feature, checked)}
                label={getBrowserPermissionDisplayValues(feature).displayName}
              />
            ))}
        </Box>
      </Box>
    </>
  )
}

export default AllowedFeaturesList
