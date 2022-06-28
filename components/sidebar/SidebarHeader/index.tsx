import type { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'

import { shortenAddress } from '@/utils/formatters'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import SidebarFiat from '@/components/sidebar/SidebarFiat'

import css from './styles.module.css'

const HeaderIconButton = ({ children }: Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <IconButton
    className={css.iconButton}
    sx={({ palette }) => ({
      backgroundColor: palette.gray[300],
      '&:hover': {
        // @ts-expect-error type '200' can't be used to index type 'PaletteColor'
        backgroundColor: palette.primary[200],
      },
    })}
  >
    {children}
  </IconButton>
)

const SafeHeader = ({ name }: { name: string }): ReactElement => {
  const { safe, loading } = useSafeInfo()

  const address = safe?.address.value || ''

  const { threshold, owners } = safe || {}

  return (
    <>
      {name && (
        <>
          <Typography paddingX="8px" variant="body2" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
            Current Safe
          </Typography>
          <Typography paddingX="8px" variant="body1" gutterBottom>
            {name}
          </Typography>
          <Divider />
        </>
      )}
      <div className={css.container}>
        <div className={css.safe}>
          <div className={css.icon}>
            {loading ? (
              <Skeleton variant="circular" width={40} height={40} />
            ) : (
              <SafeIcon address={address} threshold={threshold} owners={owners?.length} />
            )}
          </div>
          <div>
            <Typography variant="body2">
              {loading ? <Skeleton variant="text" width={86} /> : address ? shortenAddress(address) : '...'}
            </Typography>
            <Typography variant="body1">
              {loading ? <Skeleton variant="text" width={60} /> : <SidebarFiat />}
            </Typography>
          </div>
        </div>
        <div className={css.iconButtons}>
          <HeaderIconButton>
            <img src="/images/sidebar/qr.svg" alt="Address QR Code" height="16px" width="16px" />
          </HeaderIconButton>
          <HeaderIconButton>
            <img src="/images/sidebar/copy.svg" alt="Copy Address" height="16px" width="16px" />
          </HeaderIconButton>
          <HeaderIconButton>
            <img src="/images/sidebar/block-explorer.svg" alt="Open Block Explorer" height="16px" width="16px" />
          </HeaderIconButton>
        </div>
        <NewTxButton />
      </div>
    </>
  )
}

export default SafeHeader
