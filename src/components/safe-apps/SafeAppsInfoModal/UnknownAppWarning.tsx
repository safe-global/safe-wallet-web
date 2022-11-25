import { useState } from 'react'
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import Domain from './Domain'

import styles from './styles.module.css'

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

  const isColumnLayout = !!onHideWarning

  return (
    <Box
      className={styles.unknownAppWarning}
      display={isColumnLayout ? 'flex' : 'block'}
      flexDirection="column"
      height={isColumnLayout ? '100%' : 'auto'}
      alignItems="center"
    >
      <Box display={isColumnLayout ? 'block' : 'flex'} alignItems="center" mt={isColumnLayout ? 6 : 0}>
        <div className={styles.unknownAppWarningIcon}>
          <WarningIcon
            sx={{
              width: isColumnLayout ? '32px' : '24px',
              height: isColumnLayout ? '32px' : '24px',
            }}
          />
        </div>
        <Typography fontWeight={700} sx={{ marginTop: isColumnLayout ? '12px' : '24px' }}>
          Warning
        </Typography>
      </Box>
      <Typography sx={{ color: 'inherit', textAlign: isColumnLayout ? 'center' : 'left' }}>
        The application you are trying to access is not in the default Safe Apps list
      </Typography>
      <br />
      <Typography sx={{ textAlign: isColumnLayout ? 'center' : 'left' }}>
        Check the link you are using and ensure that it comes from a source you trust
      </Typography>
      <br />
      {url && <Domain url={url} showInOneLine />}
      <br />
      {onHideWarning && (
        <FormControlLabel
          className={styles.unknownAppLabel}
          control={
            <Checkbox
              checked={toggleHideWarning}
              onChange={handleToggleWarningPreference}
              name="Warning message preference"
            />
          }
          label="Don't show this warning again"
        />
      )}
    </Box>
  )
}

export default UnknownAppWarning
