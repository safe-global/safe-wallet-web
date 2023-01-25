import { Box } from '@mui/material'
import React from 'react'
import { ButtonBase, SvgIcon, Tooltip, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
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

const PendingActions = ({
  totalQueued = 0,
  pendingSignatures = 0,
  closeDrawer,
  shortName,
  address,
}: {
  totalQueued?: string | number
  pendingSignatures?: string | number
  closeDrawer?: () => void
  shortName: string
  address: string
}) => {
  const wallet = useWallet()

  const queueLink: UrlObject = {
    pathname: AppRoutes.transactions.queue,
    query: { safe: `${shortName}:${address}` },
  }

  const shortAddress = shortenAddress(wallet?.address || '')

  return (
    <Box className={css.pendingButtons}>
      {wallet && pendingSignatures > 0 && (
        <Track {...OVERVIEW_EVENTS.OPEN_MISSING_SIGNATURES}>
          <NextLink href={queueLink} passHref>
            <Tooltip title={`${shortAddress} can confirm ${pendingSignatures} transaction(s)`} placement="top" arrow>
              <ButtonBase
                className={classnames(css.pendingButton, css.missingSignatures)}
                onClick={closeDrawer}
                sx={{
                  borderTopRightRadius: ({ shape }) => shape.borderRadius,
                  borderBottomRightRadius: ({ shape }) => shape.borderRadius,
                }}
              >
                <WalletIcon provider={wallet.label} />
                <Typography variant="body2">{pendingSignatures}</Typography>
              </ButtonBase>
            </Tooltip>
          </NextLink>
        </Track>
      )}
      {!!totalQueued && (
        <Track {...OVERVIEW_EVENTS.OPEN_QUEUED_TRANSACTIONS}>
          <NextLink href={queueLink} passHref>
            <Tooltip title={`${totalQueued} transactions in the queue`} placement="top" arrow>
              <ButtonBase
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

export default PendingActions
