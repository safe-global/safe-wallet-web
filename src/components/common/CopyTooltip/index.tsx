import type { ComponentType, ReactNode } from 'react'
import React, { type ReactElement, type SyntheticEvent, useCallback, useState } from 'react'
import { Tooltip } from '@mui/material'

const cursorPointer = { cursor: 'pointer' }

export type CopyTooltipConfirmationModalProps = {
  open: boolean
  onClose: () => void
  onCopy: { (e: SyntheticEvent): void }
  text: string
}

const CopyTooltip = ({
  text,
  children,
  initialToolTipText = 'Copy to clipboard',
  onCopy,
  ConfirmationModal,
  trusted = true,
}: {
  text: string
  children?: ReactNode
  initialToolTipText?: string
  onCopy?: () => void
  trusted?: boolean
  ConfirmationModal?: ComponentType<CopyTooltipConfirmationModalProps>
}): ReactElement => {
  const [tooltipText, setTooltipText] = useState(initialToolTipText)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isCopyEnabled, setIsCopyEnabled] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleCopy = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!trusted && !showConfirmation) {
        setShowConfirmation(true)
        return
      }
      let timeout: NodeJS.Timeout | undefined

      try {
        navigator.clipboard.writeText(text).then(() => setTooltipText('Copied'))
        setShowConfirmation(false)
        setShowTooltip(true)
        timeout = setTimeout(() => {
          if (isCopyEnabled) {
            setShowTooltip(false)
            setTooltipText(initialToolTipText)
          }
        }, 750)
        onCopy?.()
      } catch (err) {
        setIsCopyEnabled(false)
        setTooltipText('Copying is disabled in your browser')
      }

      return () => clearTimeout(timeout)
    },
    [trusted, showConfirmation, text, onCopy, isCopyEnabled, initialToolTipText],
  )

  return (
    <>
      <Tooltip
        title={tooltipText}
        open={showTooltip}
        onOpen={() => setShowTooltip(true)}
        onClose={() => setShowTooltip(false)}
        placement="top"
        TransitionProps={{
          // Otherwise the initialToolTipText is briefly visible during the exit animation
          exit: false,
        }}
      >
        <span onClick={handleCopy} style={cursorPointer}>
          {children}
        </span>
      </Tooltip>
      {ConfirmationModal !== undefined && (
        <ConfirmationModal
          text={text}
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onCopy={handleCopy}
        />
      )}
    </>
  )
}

export default CopyTooltip
