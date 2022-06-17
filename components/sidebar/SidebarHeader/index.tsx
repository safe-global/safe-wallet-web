import type { ReactElement } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'

import { shortenAddress } from '@/services/formatters'
import useSafeInfo from '@/services/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import SidebarFiat from '@/components/sidebar/SidebarFiat'
import useAddressBook from '@/services/useAddressBook'
import BlockExplorer from './assets/BlockExplorer.svg'
import Copy from './assets/Copy.svg'
import QR from './assets/QR.svg'

import css from './styles.module.css'

const HeaderIconButton = ({ children }: Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <IconButton className={css.iconButton} sx={({ palette }) => ({ backgroundColor: palette.gray[300] })}>
    {children}
  </IconButton>
)

const SafeHeader = (): ReactElement => {
  const { safe } = useSafeInfo()
  const addressBook = useAddressBook()

  const address = safe?.address.value || ''
  const name = addressBook?.[address]

  const { threshold, owners } = safe || {}

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
            <SafeIcon address={address} threshold={threshold} owners={owners?.length} />
          </div>
          <div>
            <Typography variant="subtitle1">{address ? shortenAddress(address) : '...'}</Typography>
            <SidebarFiat />
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
