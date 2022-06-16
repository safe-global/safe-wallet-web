import { type ReactElement } from 'react'
import { shortenAddress } from '@/services/formatters'
import useSafeInfo from '@/services/useSafeInfo'
import useBalances from '@/services/useBalances'
import Identicon from '../Identicon'
import css from './styles.module.css'
import { Divider, IconButton, IconButtonProps, Typography } from '@mui/material'
import BlockExplorer from './assets/BlockExplorer.svg'
import Copy from './assets/Copy.svg'
import QR from './assets/QR.svg'
import NewTxButton from '../NewTxButton'
import Image from 'next/image'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'
import useAddressBook from '@/services/useAddressBook'

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
  const addressBook = useAddressBook()

  const address = safe?.address.value || ''
  const name = addressBook?.[address]

  const { threshold, owners } = safe || {}

  const [wholeNumber, decimals] = balances.fiatTotal.split('.')

  return (
    <>
      {name && (
        <>
          <Typography variant="subtitle1" paddingX="8px" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
            Current Safe
          </Typography>
          <Typography variant="h6" paddingX="8px" gutterBottom>
            {name}
          </Typography>
          <Divider />
        </>
      )}
      <div className={css.container}>
        <div className={css.safe}>
          <div className={css.icon}>
            <Identicon address={address} threshold={threshold} owners={owners?.length} />
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
            <Image src={QR} alt="Address QR Code" />
          </HeaderIconButton>
          <HeaderIconButton>
            <Image src={Copy} alt="Copy Address" />
          </HeaderIconButton>
          <HeaderIconButton>
            <Image src={BlockExplorer} alt="Open Block Explorer" />
          </HeaderIconButton>
        </div>
        <NewTxButton />
      </div>
    </>
  )
}

export default SafeHeader
