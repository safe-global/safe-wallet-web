import { Box, Chip } from '@mui/material'
import React, { useMemo } from 'react'
import { ButtonBase, SvgIcon, Tooltip, Typography } from '@mui/material'
// import CheckIcon from '@mui/icons-material/Check'
import WalletIcon from '@/components/common/WalletIcon'
import NextLink from 'next/link'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import useWallet from '@/hooks/wallets/useWallet'
import { shortenAddress } from '@/utils/formatters'
import type { UrlObject } from 'url'
import css from './styles.module.css'
import classnames from 'classnames'
import { AppRoutes } from '@/config/routes'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import CheckIcon from '@/public/images/common/check.svg'

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
    <Box className={css.pendingButtons}>
      {wallet && totalToSign && (
        <Track {...OVERVIEW_EVENTS.OPEN_MISSING_SIGNATURES}>
          <NextLink href={queueLink} passHref legacyBehavior>
            <Tooltip title={`${shortAddress} can confirm ${totalToSign} transaction(s)`} placement="top" arrow>
              <ButtonBase
                className={classnames(css.pendingButton, css.missingSignatures)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                <Chip icon={<CheckIcon />} size="small" label={`${totalToSign} to confirm`} />{' '}
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
                className={classnames(css.pendingButton, css.queued)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                <Chip icon={<TransactionsIcon />} size="small" label={`${totalQueued} pending transactions`} />
              </ButtonBase>
            </Tooltip>
          </NextLink>
        </Track>
      )}
    </Box>
  )
}

export default PendingActionButtons
