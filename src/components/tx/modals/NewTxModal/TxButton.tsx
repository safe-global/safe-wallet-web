import { Button, SvgIcon } from '@mui/material'
import type { ButtonProps } from '@mui/material'

import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NftIcon from '@/public/images/common/nft.svg'

const TxButton = ({ sx, ...props }: ButtonProps) => (
  <Button variant="contained" sx={{ '& svg path': { fill: 'currentColor' }, ...sx }} fullWidth {...props} />
)

export const SendTokensButton = ({ onClick, ...props }: ButtonProps) => (
  <TxButton onClick={onClick} startIcon={<SvgIcon component={AssetsIcon} inheritViewBox />} {...props}>
    Token transfer
  </TxButton>
)

export const SendNFTsButton = ({ onClick, ...props }: ButtonProps) => (
  <TxButton onClick={onClick} startIcon={<SvgIcon component={NftIcon} inheritViewBox />} {...props}>
    NFT transfer
  </TxButton>
)

export default TxButton
