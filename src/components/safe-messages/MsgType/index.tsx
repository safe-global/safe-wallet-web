import { Box } from '@mui/material'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import ImageFallback from '@/components/common/ImageFallback'

import txTypeCss from '@/components/transactions/TxType/styles.module.css'
import { isEIP712TypedData } from '@/utils/safe-messages'

const FALLBACK_LOGO_URI = '/images/transactions/custom.svg'
const MAX_TRIMMED_LENGTH = 20

const getMessageName = (msg: SafeMessage) => {
  if (msg.name != null) return msg.name

  if (isEIP712TypedData(msg.message)) {
    return msg.message.domain?.name || ''
  }

  const firstLine = msg.message.split('\n')[0]
  let trimmed = firstLine.slice(0, MAX_TRIMMED_LENGTH)
  if (trimmed.length < firstLine.length) {
    trimmed += '…'
  }
  return trimmed
}

const MsgType = ({ msg }: { msg: SafeMessage }) => {
  return (
    <Box className={txTypeCss.txType}>
      <ImageFallback
        src={msg.logoUri || FALLBACK_LOGO_URI}
        fallbackSrc={FALLBACK_LOGO_URI}
        alt="Message type"
        width={16}
        height={16}
      />
      {getMessageName(msg)}
    </Box>
  )
}

export default MsgType
