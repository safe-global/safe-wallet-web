import { ReactElement, useCallback, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
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

const HeaderIconButton = ({ children, ...props }: Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <IconButton className={css.iconButton} {...props}>
    {children}
  </IconButton>
)

const SafeHeader = (): ReactElement => {
  const [tooltipText, setTooltipText] = useState<string>('Copy to clipboard')
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

  const handleCopy = () => {
    const text = settings.shortName.copy && chain ? `${chain.shortName}:${safeAddress}` : safeAddress
    navigator.clipboard.writeText(text).then(() => setTooltipText('Copied'))
  }

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => setTooltipText('Copy to clipboard'), 500)
  }, [])

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

        <Tooltip title={tooltipText} placement="top" onMouseLeave={handleMouseLeave}>
          <IconButton className={css.iconButton} onClick={handleCopy}>
            <CopyIcon />
          </IconButton>
        </Tooltip>

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
