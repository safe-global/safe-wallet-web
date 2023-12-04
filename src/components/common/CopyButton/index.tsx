import type { ReactNode } from 'react'
import React, { type ReactElement } from 'react'
import CopyIcon from '@/public/images/common/copy.svg'
import { IconButton, SvgIcon } from '@mui/material'
import CopyTooltip from '../CopyTooltip'

const CopyButton = ({
  text,
  className,
  children,
  initialToolTipText = 'Copy to clipboard',
  onCopy,
}: {
  text: string
  className?: string
  children?: ReactNode
  initialToolTipText?: string
  ariaLabel?: string
  onCopy?: () => void
}): ReactElement => {
  return (
    <CopyTooltip text={text} onCopy={onCopy} initialToolTipText={initialToolTipText}>
      {children ?? (
        <IconButton aria-label={initialToolTipText} size="small" className={className}>
          <SvgIcon component={CopyIcon} inheritViewBox color="border" fontSize="small" />
        </IconButton>
      )}
    </CopyTooltip>
  )
}

export default CopyButton
