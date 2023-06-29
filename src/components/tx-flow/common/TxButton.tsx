import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, type ButtonProps } from '@mui/material'

import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { AppRoutes } from '@/config/routes'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'

const TxButton = ({ sx, ...props }: ButtonProps) => (
  <Button variant="contained" sx={{ '& svg path': { fill: 'currentColor' }, ...sx }} fullWidth {...props} />
)

export const SendTokensButton = (props: ButtonProps) => (
  <Track {...MODALS_EVENTS.SEND_FUNDS}>
    <TxButton {...props}>Send tokens</TxButton>
  </Track>
)

export const SendNFTsButton = (props: ButtonProps) => {
  const router = useRouter()

  return (
    <Track {...MODALS_EVENTS.SEND_COLLECTIBLE}>
      <Link href={{ pathname: AppRoutes.balances.nfts, query: { safe: router.query.safe } }} passHref>
        <TxButton {...props}>Send NFTs</TxButton>
      </Link>
    </Track>
  )
}

export const TxBuilderButton = (props: ButtonProps) => {
  const txBuilder = useTxBuilderApp()
  if (!txBuilder?.app) return null

  return (
    <Track {...MODALS_EVENTS.CONTRACT_INTERACTION}>
      <Link href={txBuilder.link} passHref>
        <a style={{ width: '100%' }}>
          <TxButton variant="outlined" {...props}>
            Transaction Builder
          </TxButton>
        </a>
      </Link>
    </Track>
  )
}

export default TxButton
