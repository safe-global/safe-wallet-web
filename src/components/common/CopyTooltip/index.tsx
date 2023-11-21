import type { ReactNode } from 'react'
import React, { type ReactElement, type SyntheticEvent, useCallback, useState } from 'react'
import { Tooltip } from '@mui/material'

const cursorPointer = { cursor: 'pointer' }

const CopyTooltip = ({
  text,
  children,
  initialToolTipText = 'Copy to clipboard',
  onCopy,
}: {
  text: string
  children?: ReactNode
  initialToolTipText?: string
  onCopy?: () => void
}): ReactElement => {
  const [tooltipText, setTooltipText] = useState(initialToolTipText)
  const [isCopyEnabled, setIsCopyEnabled] = useState(true)

  const handleCopy = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        navigator.clipboard.writeText(text).then(() => setTooltipText('Copied'))
        onCopy?.()
      } catch (err) {
        setIsCopyEnabled(false)
        setTooltipText('Copying is disabled in your browser')
      }
    },
    [text, onCopy],
  )

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => {
      if (isCopyEnabled) {
        setTooltipText(initialToolTipText)
      }
    }, 500)
  }, [initialToolTipText, isCopyEnabled])

  return (
    <Tooltip title={tooltipText} placement="top" onMouseLeave={handleMouseLeave}>
      <span onClick={handleCopy} style={cursorPointer}>
        {children}
      </span>
    </Tooltip>
  )
}

export default CopyTooltip
