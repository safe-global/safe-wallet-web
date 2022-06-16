import { type ReactElement } from 'react'
import { shortenAddress } from '@/services/formatters'
import useSafeInfo from '@/services/useSafeInfo'
import useBalances from '@/services/useBalances'
import Identicon from '../Identicon'
import css from './styles.module.css'
import { Box, Divider, IconButton, IconButtonProps, Typography } from '@mui/material'
import BlockExplorer from './assets/BlockExplorer.svg'
import Copy from './assets/Copy.svg'
import QR from './assets/QR.svg'
import NewTxButton from '../NewTxButton'
import Image from 'next/image'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

const HeaderIconButton = ({ children }: Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <IconButton
    className={css.iconButton}
    disableRipple
    sx={({ palette }) => ({
      backgroundColor: palette.gray[300],
    })}
  >
    {children}
  </IconButton>
)

const SafeHeader = (): ReactElement => {
  const { safe } = useSafeInfo()
  const { balances } = useBalances()
  const currency = useAppSelector(selectCurrency)

  const address = safe?.address.value || ''
  const { threshold, owners } = safe || {}

  const [wholeNumber, decimals] = balances.fiatTotal.split('.')

  return (
    <div className={css.container}>
      <div className={css.name}>
        <Typography variant="subtitle1" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
          Current Safe
        </Typography>
        <Typography variant="h6" gutterBottom>
          My Company Funds
        </Typography>
      </div>
      <Divider flexItem />
      <div className={css.safe}>
        <Box
          className={css.threshold}
          sx={({ palette }) => ({ background: palette.primaryGreen[200], color: palette.primary[400] })}
        >
          {threshold || ''}/{owners?.length || ''}
        </Box>
        <div className={css.icon}>
          <Identicon address={address} />
        </div>
        <div>
          <Typography variant="subtitle1">{address ? shortenAddress(address) : '...'}</Typography>
          <Typography variant="subtitle1" display="inline">
            {wholeNumber}
          </Typography>
          <Typography
            variant="subtitle1"
            display="inline"
            sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}
          >
            .{decimals} {currency.toUpperCase()}
          </Typography>
        </div>
      </div>
      <div className={css.iconButtons}>
        <HeaderIconButton>
          <Image src={QR} />
        </HeaderIconButton>
        <HeaderIconButton>
          <Image src={Copy} />
        </HeaderIconButton>
        <HeaderIconButton>
          <Image src={BlockExplorer} />
        </HeaderIconButton>
      </div>
      <div className={css.newTxButton}>
        <NewTxButton />
      </div>
    </div>
  )
}

export default SafeHeader
