import { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { IconButton, Tooltip } from '@mui/material'
import React, { useCallback } from 'react'

const CopyAddressButton = ({ address }: { address: string }) => {
  const settings = useAppSelector(selectSettings)
  const chain = useCurrentChain()

  const handleCopy = useCallback(() => {
    const text = settings.shortName.copy && chain ? `${chain.shortName}:${address}` : address
    navigator.clipboard.writeText(text)
  }, [address, chain, settings.shortName.copy])

  return (
    <Tooltip title="Copy to clipboard" placement="top">
      <IconButton onClick={handleCopy} sx={{ padding: 0, width: '24px', height: '24px' }}>
        <img src="/images/copy.svg" width={16} height={16} alt="Copy address" />
      </IconButton>
    </Tooltip>
  )
}

export default CopyAddressButton
