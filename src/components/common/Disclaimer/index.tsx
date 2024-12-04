import type { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'

export const Disclaimer = ({
  title,
  subtitle,
  buttonText,
  content,
  onAccept,
}: {
  title: string
  subtitle?: string
  buttonText?: string
  content: ReactNode
  onAccept: () => void
}): ReactElement => {
  return (
    <div className={css.container}>
      <Paper sx={{ maxWidth: '500px' }}>
        <Stack
          sx={[
            {
              padding: 'var(--space-3)',
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            },
            ({ palette }) => ({ borderBottom: `1px solid ${palette.border.light}` }),
          ]}
        >
          {subtitle && (
            <Typography
              sx={{
                color: 'var(--color-text-secondary)',
              }}
            >
              {subtitle}
            </Typography>
          )}

          <Box className={css.iconCircle}>
            <SvgIcon component={InfoIcon} inheritViewBox fontSize="medium" />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2">{content}</Typography>
          <Divider />
        </Stack>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 3,
            pb: 2,
          }}
        >
          <Button variant="contained" size="small" sx={{ px: '16px' }} onClick={onAccept}>
            {buttonText || 'Got it'}
          </Button>
        </Box>
      </Paper>
    </div>
  )
}

export default Disclaimer
