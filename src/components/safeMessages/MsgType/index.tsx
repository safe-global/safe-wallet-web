import { Box } from '@mui/material'

import ImageFallback from '@/components/common/ImageFallback'
import type { SafeMessage } from '@/store/safeMessagesSlice'

import txTypeCss from '@/components/transactions/TxType/styles.module.css'

const MsgType = ({ msg }: { msg: SafeMessage }) => {
  return (
    <Box className={txTypeCss.txType}>
      <ImageFallback
        src={msg.logoUri}
        fallbackSrc="/images/transactions/custom.svg"
        alt="Message type"
        width={16}
        height={16}
      />
      {msg.name}
    </Box>
  )
}

export default MsgType
