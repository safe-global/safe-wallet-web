import { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { IconButton, Tooltip } from '@mui/material'
import React, { useCallback, useState } from 'react'

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
      <IconButton onClick={handleCopy} sx={{ padding: 0, width: '24px', height: '24px' }}>
        <img src="/images/copy.svg" width={16} height={16} alt="Copy address" />
      </IconButton>
    </Tooltip>
  )
}

export default CopyAddressButton
