import { SvgIcon, Typography, Chip, Box } from '@mui/material'

import CheckIcon from '@/public/images/common/check-filled.svg'

const MfaFactorSummary = ({ enabled, label }: { enabled: boolean; label: string }) => {
  return (
    <Box display="flex" alignItems="center" gap={1} width="100%">
      <SvgIcon component={CheckIcon} sx={{ color: enabled ? 'success.main' : 'border.light' }} />
      <Typography fontWeight="bold">{label}</Typography>
      <Chip
        size="small"
        label={enabled ? 'Enabled' : 'Disabled'}
        sx={{
          ml: 'auto',
          mr: 1.5,
          backgroundColor: ({ palette }) => (enabled ? palette.secondary.light : palette.text.disabled),
          borderRadius: '4px',
        }}
      />
    </Box>
  )
}

export default MfaFactorSummary
