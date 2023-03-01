import { type ReactElement, useMemo } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'

import { formatCurrency } from '@/utils/formatNumber'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'

import css from './styles.module.css'
import QrIconBold from '@/public/images/sidebar/qr-bold.svg'
import CopyIconBold from '@/public/images/sidebar/copy-bold.svg'
import LinkIconBold from '@/public/images/sidebar/link-bold.svg'

import { selectSettings } from '@/store/settingsSlice'
import { useCurrentChain } from '@/hooks/useChains'
import { getBlockExplorerLink } from '@/utils/chains'
import EthHashInfo from '@/components/common/EthHashInfo'
import CopyButton from '@/components/common/CopyButton'
import QrCodeButton from '../QrCodeButton'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { SvgIcon } from '@mui/material'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import EnvHintButton from '@/components/settings/EnvironmentVariables/EnvHintButton'
import useSafeAddress from '@/hooks/useSafeAddress'

const SafeHeader = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances } = useVisibleBalances()
  const safeAddress = useSafeAddress()
  const { safe } = useSafeInfo()
  const { threshold, owners } = safe
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const fiatTotal = useMemo(
    () => (balances.fiatTotal ? formatCurrency(balances.fiatTotal, currency) : ''),
    [currency, balances.fiatTotal],
  )

  const addressCopyText = settings.shortName.copy && chain ? `${chain.shortName}:${safeAddress}` : safeAddress

  const blockExplorerLink = chain ? getBlockExplorerLink(chain, safeAddress) : undefined

  return (
    <div className={css.container}>
      <div className={css.info}>
        <div className={css.safe}>
          <div>
            {safeAddress ? (
              <SafeIcon address={safeAddress} threshold={threshold} owners={owners?.length} />
            ) : (
              <Skeleton variant="circular" width={40} height={40} />
            )}
          </div>

          <div className={css.address}>
            {safeAddress ? (
              <EthHashInfo address={safeAddress} shortAddress showAvatar={false} />
            ) : (
              <Typography variant="body2">
                <Skeleton variant="text" width={86} />
                <Skeleton variant="text" width={120} />
              </Typography>
            )}

            <Typography variant="body2" fontWeight={700}>
              {fiatTotal || <Skeleton variant="text" width={60} />}
            </Typography>
          </div>
        </div>

        <div className={css.iconButtons}>
          <Track {...OVERVIEW_EVENTS.SHOW_QR}>
            <QrCodeButton>
              <Tooltip title="Open QR code" placement="top">
                <IconButton className={css.iconButton}>
                  <SvgIcon component={QrIconBold} inheritViewBox color="primary" fontSize="small" />
                </IconButton>
              </Tooltip>
            </QrCodeButton>
          </Track>

          <Track {...OVERVIEW_EVENTS.COPY_ADDRESS}>
            <CopyButton text={addressCopyText} className={css.iconButton}>
              <SvgIcon component={CopyIconBold} inheritViewBox color="primary" fontSize="small" />
            </CopyButton>
          </Track>

          <Track {...OVERVIEW_EVENTS.OPEN_EXPLORER}>
            <Tooltip title={blockExplorerLink?.title || ''} placement="top">
              <IconButton
                className={css.iconButton}
                target="_blank"
                rel="noreferrer"
                href={blockExplorerLink?.href || ''}
              >
                <SvgIcon component={LinkIconBold} inheritViewBox fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          </Track>

          <EnvHintButton />
        </div>
      </div>

      <NewTxButton />
    </div>
  )
}

export default SafeHeader
