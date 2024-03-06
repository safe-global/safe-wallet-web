import lightPalette from '@/components/theme/lightPalette'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { useState } from 'react'
import Domain from './Domain'

type UnknownAppWarningProps = {
  url?: string
  onHideWarning?: (hideWarning: boolean) => void
}

const UnknownAppWarning = ({ url, onHideWarning }: UnknownAppWarningProps): React.ReactElement => {
  const [toggleHideWarning, setToggleHideWarning] = useState(false)

  const handleToggleWarningPreference = (): void => {
    onHideWarning?.(!toggleHideWarning)
    setToggleHideWarning(!toggleHideWarning)
  }

  return (
    <Box data-sid="64250" display="flex" flexDirection="column" height="100%" alignItems="center">
      <Box data-sid="92780" display="block" alignItems="center" mt={6}>
        <WarningAmberOutlinedIcon fontSize="large" color="warning" />
        <Typography variant="h3" fontWeight={700} mt={2} color={lightPalette.warning.main}>
          Warning
        </Typography>
      </Box>
      <Typography my={2} fontWeight={700} color={lightPalette.warning.main}>
        The application you are trying to access is not in the default Safe Apps list
      </Typography>

      <Typography my={2} textAlign="center">
        Check the link you are using and ensure that it comes from a source you trust
      </Typography>

      {url && <Domain url={url} showInOneLine />}

      {onHideWarning && (
        <Box data-sid="47484" mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={toggleHideWarning}
                onChange={handleToggleWarningPreference}
                name="Warning message preference"
              />
            }
            label="Don't show this warning again"
          />
        </Box>
      )}
    </Box>
  )
}

export default UnknownAppWarning
