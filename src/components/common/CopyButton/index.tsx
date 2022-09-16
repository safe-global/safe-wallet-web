import React, { type ReactElement, ReactNode, type SyntheticEvent, useCallback, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { IconButton, Tooltip } from '@mui/material'

const CopyButton = ({
  text,
  className,
  children,
  initialToolTipText = 'Copy to clipboard',
}: {
  text: string
  className?: string
  children?: ReactNode
  initialToolTipText?: string
  ariaLabel?: string
}): ReactElement => {
  const [tooltipText, setTooltipText] = useState(initialToolTipText)

  const handleCopy = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()
      navigator.clipboard.writeText(text).then(() => setTooltipText('Copied'))
    },
    [text],
  )

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => setTooltipText(initialToolTipText), 500)
  }, [initialToolTipText])

  return (
    <Tooltip title={tooltipText} placement="top" onMouseLeave={handleMouseLeave}>
      <IconButton aria-label={initialToolTipText} onClick={handleCopy} size="small" className={className}>
        {children ?? <ContentCopyIcon fontSize="small" color="border" sx={{ width: '16px', height: '16px' }} />}
      </IconButton>
    </Tooltip>
  )
}

export default CopyButton
