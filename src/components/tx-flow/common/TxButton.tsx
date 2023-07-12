import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, type ButtonProps } from '@mui/material'

import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { AppRoutes } from '@/config/routes'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'

const buttonSx = {
  height: '58px',
  '& svg path': { fill: 'currentColor' },
}

export const SendTokensButton = ({ onClick, sx }: { onClick: () => void; sx?: ButtonProps['sx'] }) => {
  return (
    <Track {...MODALS_EVENTS.SEND_FUNDS}>
      <Button onClick={onClick} variant="contained" sx={sx ?? buttonSx} fullWidth>
        Send tokens
      </Button>
    </Track>
  )
}

export const SendNFTsButton = () => {
  const router = useRouter()

  return (
    <Track {...MODALS_EVENTS.SEND_COLLECTIBLE}>
      <Link href={{ pathname: AppRoutes.balances.nfts, query: { safe: router.query.safe } }} passHref>
        <Button variant="contained" sx={buttonSx} fullWidth>
          Send NFTs
        </Button>
      </Link>
    </Track>
  )
}

export const TxBuilderButton = () => {
  const txBuilder = useTxBuilderApp()
  if (!txBuilder?.app) return null

  return (
    <Track {...MODALS_EVENTS.CONTRACT_INTERACTION}>
      <Link href={txBuilder.link} passHref>
        <a style={{ width: '100%' }}>
          <Button variant="outlined" sx={buttonSx} fullWidth>
            Transaction Builder
          </Button>
        </a>
      </Link>
    </Track>
  )
}
