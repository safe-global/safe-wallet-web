import type { ReactNode } from 'react'
import React, { type ReactElement, type SyntheticEvent, useCallback, useState } from 'react'
import { Tooltip } from '@mui/material'
import ConfirmCopyModal from './ConfirmCopyModal'

const spanStyle = { cursor: 'pointer' }

const CopyTooltip = ({
  text,
  children,
  initialToolTipText = 'Copy to clipboard',
  onCopy,
  dialogContent,
}: {
  text: string
  children?: ReactNode
  initialToolTipText?: string
  onCopy?: (e: SyntheticEvent) => void
  dialogContent?: ReactElement
}): ReactElement => {
  const [tooltipText, setTooltipText] = useState(initialToolTipText)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isCopyEnabled, setIsCopyEnabled] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleCopy = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (dialogContent && !showConfirmation) {
        setShowConfirmation(true)
        return
      }

      let timeout: NodeJS.Timeout | undefined

      const copyToClipboard = async (text: string): Promise<boolean> => {
        if (navigator.clipboard && window.isSecureContext) {
          // Use Clipboard API if available and in secure context
          try {
            await navigator.clipboard.writeText(text)
            return true
          } catch (err) {
            console.warn('Clipboard API failed:', err)
          }
        }

        // Fallback for iOS
        const textArea = document.createElement('textarea')
        textArea.value = text
        // Avoid scrolling to bottom
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.position = 'fixed'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          // Using touch events for iOS
          const event = new TouchEvent('touch')
          textArea.dispatchEvent(event)
          document.execCommand('selectall')
          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)
          return successful
        } catch (err) {
          console.warn('execCommand failed:', err)
          document.body.removeChild(textArea)
          return false
        }
      }

      copyToClipboard(text)
        .then((success) => {
          if (success) {
            setTooltipText('Copied')
            setShowConfirmation(false)
            setShowTooltip(true)
            timeout = setTimeout(() => {
              if (isCopyEnabled) {
                setShowTooltip(false)
                setTooltipText(initialToolTipText)
              }
            }, 750)
            onCopy?.(e)
          } else {
            throw new Error('Copying failed')
          }
        })
        .catch((err) => {
          console.error('Copy failed:', err)
          setIsCopyEnabled(false)
          setTooltipText('Copying is disabled in your browser')
        })

      return () => clearTimeout(timeout)
    },
    [dialogContent, showConfirmation, text, onCopy, isCopyEnabled, initialToolTipText],
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
        <span onClick={handleCopy} style={spanStyle}>
          {children}
        </span>
      </Tooltip>
      {dialogContent !== undefined && (
        <ConfirmCopyModal onClose={() => setShowConfirmation(false)} onCopy={handleCopy} open={showConfirmation}>
          {dialogContent}
        </ConfirmCopyModal>
      )}
    </>
  )
}

export default CopyTooltip
