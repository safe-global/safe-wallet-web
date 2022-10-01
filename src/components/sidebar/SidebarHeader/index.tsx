import { ReactElement, useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'

import { formatCurrency } from '@/utils/formatNumber'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import useBalances from '@/hooks/useBalances'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'

import css from './styles.module.css'
import QrIcon from '@/public/images/sidebar/qr.svg'
import CopyIcon from '@/public/images/sidebar/copy.svg'
import LinkIcon from '@/public/images/sidebar/link.svg'

import { selectSettings } from '@/store/settingsSlice'
import { useCurrentChain } from '@/hooks/useChains'
import { getBlockExplorerLink } from '@/utils/chains'
import EthHashInfo from '@/components/common/EthHashInfo'
import CopyButton from '@/components/common/CopyButton'
import QrCodeButton from '../QrCodeButton'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { SvgIcon } from '@mui/material'

const HeaderIconButton = ({
  title,
  children,
  ...props
}: { title: string } & Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <Tooltip title={title} placement="top">
    <IconButton className={css.iconButton} {...props}>
      {children}
    </IconButton>
  </Tooltip>
)

const SafeHeader = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances, loading: balancesLoading } = useBalances()
  const { safe, safeAddress, safeLoading } = useSafeInfo()
  const { threshold, owners } = safe
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)
  const [fiatTotal, setFiatTotal] = useState<string>('')

  useEffect(() => {
    setFiatTotal(balancesLoading ? '' : formatCurrency(balances.fiatTotal, currency))
  }, [currency, balances.fiatTotal, balancesLoading])

  const addressCopyText = settings.shortName.copy && chain ? `${chain.shortName}:${safeAddress}` : safeAddress

  const blockExplorerLink = chain ? getBlockExplorerLink(chain, safeAddress) : undefined

  return (
    <div className={css.container}>
      <div className={css.safe}>
        {safeLoading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <SafeIcon address={safeAddress} threshold={threshold} owners={owners?.length} />
        )}

        <div className={css.address}>
          {safeLoading ? (
            <Typography variant="body2">
              <Skeleton variant="text" width={86} />
            </Typography>
          ) : (
            <EthHashInfo address={safeAddress} shortAddress showAvatar={false} />
          )}

          <Typography variant="body1" fontWeight={700}>
            {fiatTotal || <Skeleton variant="text" width={60} />}
          </Typography>
        </div>
      </div>

      <div className={css.iconButtons}>
        <Track {...OVERVIEW_EVENTS.SHOW_QR}>
          <QrCodeButton>
            <HeaderIconButton title="Open QR code">
              <SvgIcon component={QrIcon} inheritViewBox color="primary" />
            </HeaderIconButton>
          </QrCodeButton>
        </Track>

        <Track {...OVERVIEW_EVENTS.COPY_ADDRESS}>
          <CopyButton text={addressCopyText} className={css.iconButton}>
            <SvgIcon component={CopyIcon} inheritViewBox color="primary" />
          </CopyButton>
        </Track>

        <Track {...OVERVIEW_EVENTS.OPEN_EXPLORER}>
          <a target="_blank" rel="noreferrer" href={blockExplorerLink?.href || '#'}>
            <HeaderIconButton title={blockExplorerLink?.title || ''}>
              <SvgIcon component={LinkIcon} inheritViewBox />
            </HeaderIconButton>
          </a>
        </Track>
      </div>

      <NewTxButton />
    </div>
  )
}

export default SafeHeader
