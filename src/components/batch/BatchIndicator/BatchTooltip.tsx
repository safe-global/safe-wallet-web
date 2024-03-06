import { Box, SvgIcon } from '@mui/material'
import { useEffect, useState, type ReactElement } from 'react'

import { CustomTooltip } from '@/components/common/CustomTooltip'
import SuccessIcon from '@/public/images/common/success.svg'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const BatchTooltip = ({ children }: { children: ReactElement }) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  // Click outside to close the tooltip
  useEffect(() => {
    const handleClickOutside = () => setShowTooltip(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Show tooltip when tx is added to batch
  useEffect(() => {
    return txSubscribe(TxEvent.BATCH_ADD, () => setShowTooltip(true))
  }, [])

  return (
    <CustomTooltip
      open={showTooltip}
      onClose={() => setShowTooltip(false)}
      title={
        <Box data-sid="13038" display="flex" flexDirection="column" alignItems="center" p={2} gap={2}>
          <Box data-sid="92994" fontSize="53px">
            <SvgIcon component={SuccessIcon} inheritViewBox fontSize="inherit" />
          </Box>
          Transaction is added to batch
        </Box>
      }
    >
      <div>{children}</div>
    </CustomTooltip>
  )
}

export default BatchTooltip
