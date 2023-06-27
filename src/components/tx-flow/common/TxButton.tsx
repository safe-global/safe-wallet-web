import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, SvgIcon, type ButtonProps } from '@mui/material'

import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NftIcon from '@/public/images/common/nft.svg'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { AppRoutes } from '@/config/routes'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'

const TxButton = ({ sx, ...props }: ButtonProps) => (
  <Button variant="contained" sx={{ '& svg path': { fill: 'currentColor' }, ...sx }} fullWidth {...props} />
)

export const SendTokensButton = ({ onClick, ...props }: ButtonProps) => (
  <Track {...MODALS_EVENTS.SEND_FUNDS}>
    <TxButton onClick={onClick} startIcon={<SvgIcon component={AssetsIcon} inheritViewBox />} {...props}>
      Send tokens
    </TxButton>
  </Track>
)

export const SendNFTsButton = ({ onClick, ...props }: ButtonProps) => {
  const router = useRouter()

  return (
    <Track {...MODALS_EVENTS.SEND_COLLECTIBLE}>
      <Link href={{ pathname: AppRoutes.balances.nfts, query: { safe: router.query.safe } }} passHref>
        <TxButton startIcon={<SvgIcon component={NftIcon} inheritViewBox />} {...props}>
          Send NFTs
        </TxButton>
      </Link>
    </Track>
  )
}

export const TxBuilderButton = ({ ...props }: ButtonProps) => {
  const txBuilder = useTxBuilderApp()
  if (!txBuilder?.app) return null

  return (
    <Track {...MODALS_EVENTS.CONTRACT_INTERACTION}>
      <Link href={txBuilder.link} passHref>
        <a style={{ width: '100%' }}>
          <TxButton
            startIcon={<img src={txBuilder.app.iconUrl} height={20} width="auto" alt={txBuilder.app.name} />}
            variant="outlined"
            {...props}
          >
            Contract interaction
          </TxButton>
        </a>
      </Link>
    </Track>
  )
}

export default TxButton
