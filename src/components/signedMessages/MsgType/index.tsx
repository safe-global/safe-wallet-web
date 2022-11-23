import { Box } from '@mui/material'

import ImageFallback from '@/components/common/ImageFallback'
import type { SignedMessage } from '@/store/signedMessagesSlice'

import txTypeCss from '@/components/transactions/TxType/styles.module.css'

const MsgType = ({ msg }: { msg: SignedMessage }) => {
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
