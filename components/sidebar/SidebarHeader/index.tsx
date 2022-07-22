import { ReactElement, useMemo } from 'react'
import Typography from '@mui/material/Typography'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'

import { formatCurrency } from '@/utils/formatNumber'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import useBalances from '@/hooks/useBalances'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

import css from './styles.module.css'
import QrIcon from '@/public/images/sidebar/qr.svg'
import CopyIcon from '@/public/images/sidebar/copy.svg'

import { selectSettings } from '@/store/settingsSlice'
import { useCurrentChain } from '@/hooks/useChains'
import { getExplorerLink } from '@/utils/gateway'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import EthHashInfo from '@/components/common/EthHashInfo'
import CopyButton from '@/components/common/CopyButton'

const HeaderIconButton = ({ children, ...props }: Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <IconButton className={css.iconButton} {...props}>
    {children}
  </IconButton>
)

const SafeHeader = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances } = useBalances()
  const { safe, safeAddress, safeLoading } = useSafeInfo()
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const { threshold, owners } = safe

  // TODO: Format to parts w/ style
  const fiat = useMemo(() => {
    return formatCurrency(balances.fiatTotal, currency)
  }, [currency, balances.fiatTotal])

  const text = settings.shortName.copy && chain ? `${chain.shortName}:${safeAddress}` : safeAddress

  return (
    <div className={css.container}>
      <div className={css.safe}>
        <div className={css.icon}>
          {safeLoading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <SafeIcon address={safeAddress} threshold={threshold} owners={owners?.length} />
          )}
        </div>

        <div>
          <Typography variant="body2">
            {safeLoading ? (
              <Skeleton variant="text" width={86} />
            ) : (
              <EthHashInfo address={safeAddress} shortAddress showAvatar={false} />
            )}
          </Typography>
          <Typography variant="body1">{safeLoading ? <Skeleton variant="text" width={60} /> : fiat}</Typography>
        </div>
      </div>

      <div className={css.iconButtons}>
        {/* TODO: Add QR functionality */}
        <HeaderIconButton>
          <QrIcon />
        </HeaderIconButton>

        <CopyButton text={text} className={css.iconButton}>
          <CopyIcon />
        </CopyButton>

        <a
          target="_blank"
          rel="noreferrer"
          {...(chain && getExplorerLink(safeAddress, chain.blockExplorerUriTemplate))}
        >
          <HeaderIconButton>
            <OpenInNewRoundedIcon color="primary" fontSize="small" />
          </HeaderIconButton>
        </a>
      </div>

      <NewTxButton />
    </div>
  )
}

export default SafeHeader
