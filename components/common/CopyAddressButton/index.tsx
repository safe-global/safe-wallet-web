import React, { useCallback, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { IconButton, Tooltip } from '@mui/material'

const CopyAddressButton = ({ address }: { address: string }) => {
  const [tooltipText, setTooltipText] = useState('Copy to clipboard')
  const settings = useAppSelector(selectSettings)
  const chain = useCurrentChain()

  const handleCopy = useCallback(() => {
    const text = settings.shortName.copy && chain ? `${chain.shortName}:${address}` : address
    navigator.clipboard.writeText(text).then(() => setTooltipText('Copied'))
  }, [address, chain, settings.shortName.copy])

  const handleMouseLeave = () => {
    setTimeout(() => setTooltipText('Copy to clipboard'), 500)
  }

  return (
    <Tooltip title={tooltipText} placement="top" onMouseLeave={handleMouseLeave}>
      <IconButton onClick={handleCopy} size="small">
        <ContentCopyIcon fontSize="small" color="border" sx={{ width: '16px', height: '16px' }} />
      </IconButton>
    </Tooltip>
  )
}

export default CopyAddressButton
