import { Box } from '@mui/material'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import ImageFallback from '@/components/common/ImageFallback'

import css from './styles.module.css'

const FALLBACK_LOGO_URI = '/images/transactions/custom.svg'

const MsgType = ({ msg }: { msg: SafeMessage }) => {
  return (
    <Box className={css.type}>
      <ImageFallback
        src={msg.logoUri || FALLBACK_LOGO_URI}
        fallbackSrc={FALLBACK_LOGO_URI}
        alt="Message type"
        width={16}
        height={16}
      />
      {msg.name}
    </Box>
  )
}

export default MsgType
