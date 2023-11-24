import { type CircularProgressProps, CircularProgress, Typography, Box, Button } from '@mui/material'
import { useState, useCallback, useEffect, type ReactNode } from 'react'

const CircularProgressWithLabel = (props: CircularProgressProps & { value: number; label: string }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {props.label}
        </Typography>
      </Box>
    </Box>
  )
}

const CooldownButton = ({
  onClick,
  cooldown,
  startDisabled = true,
  children,
}: {
  onClick: () => void
  startDisabled?: boolean
  /** Cooldown in seconds */
  cooldown: number
  children: ReactNode
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [lastSendTime, setLastSendTime] = useState(0)

  const adjustSeconds = useCallback(() => {
    const remainingCoolDownSeconds = Math.max(0, cooldown * 1000 - (Date.now() - lastSendTime)) / 1000
    setRemainingSeconds(remainingCoolDownSeconds)
  }, [cooldown, lastSendTime])

  useEffect(() => {
    if (startDisabled) {
      setLastSendTime(Date.now())
    }
  }, [startDisabled])

  useEffect(() => {
    // Counter for progress
    const interval = setInterval(adjustSeconds, 1000)
    return () => clearInterval(interval)
  }, [adjustSeconds])

  const handleClick = () => {
    setLastSendTime(Date.now())
    onClick()
  }

  const resendProgress = ((cooldown - remainingSeconds) / cooldown) * 100

  return (
    <Button size="small" onClick={handleClick} disabled={remainingSeconds > 0}>
      <Box display="flex" flexDirection="row" gap={1} alignItems="center">
        <Typography>{children}</Typography>
        {remainingSeconds > 0 && (
          <CircularProgressWithLabel
            variant="determinate"
            color="secondary"
            size={28}
            value={resendProgress}
            label={`${Math.floor(remainingSeconds)}s`}
          />
        )}
      </Box>
    </Button>
  )
}

export default CooldownButton
