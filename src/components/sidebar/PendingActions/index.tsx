import { Box, Chip } from '@mui/material'
import React, { useMemo } from 'react'
import { ButtonBase, Tooltip } from '@mui/material'
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
    <Box>
      {totalQueued && (
        <Track {...OVERVIEW_EVENTS.OPEN_QUEUED_TRANSACTIONS}>
          <NextLink href={queueLink} passHref legacyBehavior>
            <Tooltip title={`${totalQueued} transactions in the queue`} placement="top" arrow>
              <ButtonBase
                className={classnames(css.pendingButton)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                <Chip
                  className={css.queued}
                  icon={<TransactionsIcon style={{ color: 'var(--color-border-main)' }} />}
                  size="small"
                  label={`${totalQueued} pending transactions`}
                />
              </ButtonBase>
            </Tooltip>
          </NextLink>
        </Track>
      )}

      {wallet && totalToSign && (
        <Track {...OVERVIEW_EVENTS.OPEN_MISSING_SIGNATURES}>
          <NextLink href={queueLink} passHref legacyBehavior>
            <Tooltip title={`${shortAddress} can confirm ${totalToSign} transaction(s)`} placement="top" arrow>
              <ButtonBase
                className={classnames(css.pendingButton)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                <Chip
                  className={css.missingSignatures}
                  icon={<CheckIcon style={{ color: 'var(--color-warning-main)' }} />}
                  size="small"
                  label={`${totalToSign} to confirm`}
                />{' '}
              </ButtonBase>
            </Tooltip>
          </NextLink>
        </Track>
      )}
    </Box>
  )
}

export default PendingActionButtons
