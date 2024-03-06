import Track from '@/components/common/Track'
import WalletIcon from '@/components/common/WalletIcon'
import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { shortenAddress } from '@/utils/formatters'
import CheckIcon from '@mui/icons-material/Check'
import { Box, ButtonBase, SvgIcon, Tooltip, Typography } from '@mui/material'
import classnames from 'classnames'
import NextLink from 'next/link'
import { useMemo } from 'react'
import type { UrlObject } from 'url'
import css from './styles.module.css'

const PendingActionButtons = ({
  totalQueued,
  totalToSign,
  closeDrawer,
  shortName,
  safeAddress,
}: {
  totalQueued: string
  totalToSign: string
  closeDrawer?: () => void
  shortName: string
  safeAddress: string
}) => {
  const wallet = useWallet()

  const queueLink: UrlObject = useMemo(
    () => ({
      pathname: AppRoutes.transactions.queue,
      query: { safe: `${shortName}:${safeAddress}` },
    }),
    [safeAddress, shortName],
  )

  const shortAddress = shortenAddress(wallet?.address || '')

  return (
    <Box data-sid="82009" className={css.pendingButtons}>
      {wallet && totalToSign && (
        <Track {...OVERVIEW_EVENTS.OPEN_MISSING_SIGNATURES}>
          <NextLink href={queueLink} passHref legacyBehavior>
            <Tooltip title={`${shortAddress} can confirm ${totalToSign} transaction(s)`} placement="top" arrow>
              <ButtonBase
                data-sid="11932"
                data-testid="missing-signature-info"
                className={classnames(css.pendingButton, css.missingSignatures)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                <WalletIcon provider={wallet.label} icon={wallet.icon} />
                <Typography variant="body2">{totalToSign}</Typography>
              </ButtonBase>
            </Tooltip>
          </NextLink>
        </Track>
      )}

      {totalQueued && (
        <Track {...OVERVIEW_EVENTS.OPEN_QUEUED_TRANSACTIONS}>
          <NextLink href={queueLink} passHref legacyBehavior>
            <Tooltip title={`${totalQueued} transactions in the queue`} placement="top" arrow>
              <ButtonBase
                data-sid="17234"
                data-testid="queued-tx-info"
                className={classnames(css.pendingButton, css.queued)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                {/* TODO: replace for Icon library */}
                <SvgIcon component={CheckIcon} inheritViewBox fontSize="small" />
                <Typography variant="body2">{totalQueued}</Typography>
              </ButtonBase>
            </Tooltip>
          </NextLink>
        </Track>
      )}
    </Box>
  )
}

export default PendingActionButtons
