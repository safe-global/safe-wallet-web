import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, type ButtonProps } from '@mui/material'

import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { AppRoutes } from '@/config/routes'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'
import { useContext } from 'react'
import { TxModalContext } from '..'

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
  const { setTxFlow } = useContext(TxModalContext)

  const isNftPage = router.pathname === AppRoutes.balances.nfts
  const onClick = isNftPage ? () => setTxFlow(undefined) : undefined

  return (
    <Track {...MODALS_EVENTS.SEND_COLLECTIBLE}>
      <Link href={{ pathname: AppRoutes.balances.nfts, query: { safe: router.query.safe } }} passHref legacyBehavior>
        <Button variant="contained" sx={buttonSx} fullWidth onClick={onClick}>
          Send NFTs
        </Button>
      </Link>
    </Track>
  )
}

export const TxBuilderButton = () => {
  const txBuilder = useTxBuilderApp()
  const router = useRouter()
  const { setTxFlow } = useContext(TxModalContext)

  if (!txBuilder?.app) return null

  const isTxBuilder = typeof txBuilder.link.query === 'object' && router.query.appUrl === txBuilder.link.query?.appUrl
  const onClick = isTxBuilder ? () => setTxFlow(undefined) : undefined

  return (
    <Track {...MODALS_EVENTS.CONTRACT_INTERACTION}>
      <Link href={txBuilder.link} passHref style={{ width: '100%' }}>
        <Button variant="outlined" sx={buttonSx} fullWidth onClick={onClick}>
          Transaction Builder
        </Button>
      </Link>
    </Track>
  )
}
