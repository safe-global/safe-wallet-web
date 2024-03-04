import { Link } from '@mui/material'
import { useState, useCallback, useEffect, type ReactNode } from 'react'

// TODO: Extract into a hook so it can be reused for buttons and not just links
const CooldownLink = ({
  onClick,
  cooldown,
  startDisabled = false,
  children,
}: {
  onClick: () => void
  startDisabled?: boolean
  /** Cooldown in seconds */
  cooldown: number
  children: ReactNode
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(startDisabled ? cooldown : 0)
  const [lastSendTime, setLastSendTime] = useState(startDisabled ? Date.now() : 0)

  const adjustSeconds = useCallback(() => {
    const remainingCoolDownSeconds = Math.max(0, cooldown * 1000 - (Date.now() - lastSendTime)) / 1000
    setRemainingSeconds(remainingCoolDownSeconds)
  }, [cooldown, lastSendTime])

  useEffect(() => {
    // Counter for progress
    const interval = setInterval(adjustSeconds, 1000)
    return () => clearInterval(interval)
  }, [adjustSeconds])

  const handleClick = () => {
    setLastSendTime(Date.now())
    setRemainingSeconds(cooldown)
    onClick()
  }

  const isDisabled = remainingSeconds > 0

  return (
    <Link
      sx={{
        color: ({ palette }) => (isDisabled ? palette.text.disabled : undefined),
        textDecoration: 'none',
        pointerEvents: isDisabled ? 'none' : undefined,
        verticalAlign: 'inherit',
      }}
      component="button"
      onClick={handleClick}
      disabled={remainingSeconds > 0}
    >
      <span>
        {children}
        {remainingSeconds > 0 && ` in ${Math.floor(remainingSeconds)}s`}
      </span>
    </Link>
  )
}

export default CooldownLink
